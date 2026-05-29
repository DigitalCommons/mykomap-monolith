import { useRef, useEffect, useState } from "react";
import { MapRef } from "react-map-gl/maplibre";
import { useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  performSearchFromQuery,
  selectIsFilterActive,
  selectSearchQuery,
  selectVisibleIndexes,
} from "../panel/searchPanel/searchSlice";
import { fetchLocations, selectFeatures, selectLocation } from "./mapSlice";
import {
  closePopup,
  openPopup,
  selectPopupIndex,
  selectPopupId,
  selectPopupIsOpen,
  selectPopupOrigin,
} from "../popup/popupSlice";
import {
  selectCurrentLanguage,
  selectMarkerIcons,
} from "../../app/configSlice";
import { selectMapConfig, selectConfigStatus } from "../../app/configSlice";
import { useMediaQuery } from "@mui/material";
import {
  closePanel,
  closeResultsPanel,
  openPanel,
  openResultsPanel,
  setSelectedTab,
  selectPanelOpen,
  selectResultsPanelOpen,
} from "../panel/panelSlice";
import { closeMapKey } from "./mapSlice";
import { DEVICE_ID, Event, trackEvent } from "../../services/analytics";
import MapLibre from "./MapLibre";

const MapWrapper = () => {
  const isFilterActive = useAppSelector(selectIsFilterActive);
  // If there is no filter active , visible indexes is undefined to show all features
  const visibleIndexes = useAppSelector(selectVisibleIndexes);
  const features = useAppSelector((state) =>
    selectFeatures(state, isFilterActive ? visibleIndexes : undefined),
  );
  const searchQuery = JSON.stringify(useAppSelector(selectSearchQuery));
  const popupIsOpen = useAppSelector(selectPopupIsOpen);
  const popupIndex = useAppSelector(selectPopupIndex);
  const popupId = useAppSelector(selectPopupId);
  const popupLocation = useAppSelector(selectLocation(popupIndex));
  const popupOrigin = useAppSelector(selectPopupOrigin);
  const language = useAppSelector(selectCurrentLanguage);
  const mapConfig = useAppSelector(selectMapConfig);
  const markerIcons = useAppSelector(selectMarkerIcons);
  const configStatus = useAppSelector(selectConfigStatus);
  const panelOpen = useAppSelector(selectPanelOpen);
  const resultsPanelOpen = useAppSelector(selectResultsPanelOpen);
  const mapRef = useRef<MapRef>(null);
  const dispatch = useAppDispatch();
  const isMedium = useMediaQuery("(min-width: 897px)");
  const [mapLoaded, setMapLoaded] = useState(false);

  // use this to manage popup and search state in the URL
  const [searchParams, setSearchParams] = useSearchParams(
    new window.URLSearchParams(),
  );
  const POPUP_ID_PARAM = "popupId";
  const SEARCH_QUERY_PARAM = "q";
  const DEVICE_ID_PARAM = "ref";

  const popupCreatedCallback = (itemIx: number) => {
    if (!isMedium) dispatch(closeMapKey());
    dispatch(openPopup({ idOrIndex: `@${itemIx}`, origin: "map" }));
  };

  const popupClosedCallback = () => {
    console.log("Popup closed in MapLibre");
    dispatch(closePopup());
  };

  useEffect(() => {
    dispatch(fetchLocations());
  }, [configStatus]);

  // Keep the mapLibre popup and URL in sync with the Redux state (the latter being the source of truth)
  useEffect(() => {
    const urlPopupId = searchParams.get(POPUP_ID_PARAM) ?? "";
    const urlSearchQuery = searchParams.get(SEARCH_QUERY_PARAM) || "{}";

    // First let's update URL parameters if needed, in a single call to avoid conflicts
    if (
      mapRef.current &&
      (urlSearchQuery !== searchQuery || urlPopupId !== popupId)
    ) {
      setSearchParams(
        (params) => {
          if (searchQuery !== "{}") {
            params.set(SEARCH_QUERY_PARAM, searchQuery);
          } else {
            params.delete(SEARCH_QUERY_PARAM);
          }

          if (popupIsOpen) {
            params.set(POPUP_ID_PARAM, popupId);
          } else {
            params.delete(POPUP_ID_PARAM);
          }

          return params;
        },
        {
          // Set replace to false to enable browser history for back/forward navigation
          replace: false,
        },
      );
    }
  }, [popupIsOpen, popupIndex, searchQuery]);

  // On every change of URL params, check if the filter or popup state in the URL matches the Redux
  // state. If not, we must have clicked on a shared URL with this state or used the browser history
  // buttons, so update Redux accordingly, which will trigger MapLibre to update too.
  useEffect(() => {
    const urlPopupId = searchParams.get(POPUP_ID_PARAM) ?? "";
    const urlSearchQuery = searchParams.get(SEARCH_QUERY_PARAM) || "{}";
    const popupStateMismatch = urlPopupId !== popupId;
    const searchStateMismatch = urlSearchQuery !== searchQuery;

    if (mapRef.current) {
      const maybePerformSearch = async () => {
        if (searchStateMismatch) {
          console.log(
            `Found search query ${
              urlSearchQuery
            } in URL, ${searchQuery} in Redux`,
          );
          await dispatch(performSearchFromQuery(JSON.parse(urlSearchQuery)));
        }
      };

      // Perform search first, then open popup (which is possible depending on search results)
      maybePerformSearch().then(() => {
        if (popupStateMismatch) {
          console.log(
            `Found popupId ${urlPopupId} in URL, ${popupId} in Redux`,
          );
          if (urlPopupId === "") {
            dispatch(closePopup());
          } else {
            dispatch(openPopup({ idOrIndex: urlPopupId, origin: "directory" }));
          }
        }

        // Open left panel with results if we're on desktop and there's a search query in the URL,
        // but not an active popup
        if (isMedium && (popupStateMismatch || searchStateMismatch)) {
          dispatch(setSelectedTab(1));
          if (urlSearchQuery === "{}") {
            dispatch(closeResultsPanel());
          } else {
            dispatch(openResultsPanel());
          }
          if (urlPopupId === "") {
            dispatch(openPanel());
          } else {
            dispatch(closePanel());
          }
        }
      });
    } else {
      // The map is not created yet, check whether the URL was created by a different client. If so,
      // it means the app must have been launched by clicking a shared URL. Send an analytic.
      const urlDeviceId = searchParams.get(DEVICE_ID_PARAM);

      if (urlDeviceId && urlDeviceId !== DEVICE_ID) {
        if (urlPopupId !== "") {
          trackEvent(Event.ITEM.SHARE, {
            item_id: urlPopupId,
            sharer_id: urlDeviceId,
          });
        } else if (urlSearchQuery !== "{}") {
          trackEvent(Event.SEARCH.SHARE, {
            search_filter: JSON.parse(urlSearchQuery).filter,
            search_text: JSON.parse(urlSearchQuery).text,
            sharer_id: urlDeviceId,
          });
        } else {
          trackEvent(Event.MAP.SHARE, { sharer_id: urlDeviceId });
        }
      }

      // Now, set our own device ID in the URL
      if (DEVICE_ID) {
        setSearchParams(
          (params) => {
            params.set(DEVICE_ID_PARAM, DEVICE_ID);
            return params;
          },
          { replace: true },
        );
      }
    }
  }, [mapLoaded, searchParams]);

  useEffect(() => {
    mapRef.current?.fire("changeLanguage", { language });
  }, [language]);

  const PANEL_WIDTH = 375; // From CSS variable --panel-width-desktop
  let leftPanelWidth =
    isMedium && panelOpen
      ? resultsPanelOpen
        ? PANEL_WIDTH * 2
        : PANEL_WIDTH
      : 0;
  const mapCenterOffsetPixels = [leftPanelWidth / 2, 0];

  return (
    mapConfig &&
    features && (
      <MapLibre
        mapRef={mapRef}
        mapLoadedCallback={() => setMapLoaded(true)}
        language={language}
        mapBounds={mapConfig.mapBounds}
        features={features}
        markerIcons={markerIcons}
        popupCreatedCallback={popupCreatedCallback}
        popupClosedCallback={popupClosedCallback}
        popupIndex={popupIndex}
        popupLocation={popupLocation}
        popupOrigin={popupOrigin}
        mapCenterOffsetPixels={mapCenterOffsetPixels}
      />
    )
  );
};

export default MapWrapper;
