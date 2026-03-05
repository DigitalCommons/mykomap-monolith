import { useRef, useEffect, useState } from "react";
import { createMap, fitBoundsToFeatures, setPanelOpenValues } from "./mapLibre";
import { useSearchParams } from "react-router";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  performSearchFromQuery,
  selectIsFilterActive,
  selectSearchQuery,
  selectVisibleIndexes,
} from "../panel/searchPanel/searchSlice";
import { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
import { fetchLocations, selectFeatures, selectLocation } from "./mapSlice";
import {
  closePopup,
  openPopup,
  selectPopupIndex,
  selectPopupId,
  selectPopupIsOpen,
} from "../popup/popupSlice";
import { selectCurrentLanguage } from "../../app/configSlice";
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
import { DEVICE_ID, Event, trackEvent } from "../../services/analytics";

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
  const language = useAppSelector(selectCurrentLanguage);
  const mapConfig = useAppSelector(selectMapConfig);
  const configStatus = useAppSelector(selectConfigStatus);
  const panelOpen = useAppSelector(selectPanelOpen);
  const resultsPanelOpen = useAppSelector(selectResultsPanelOpen);
  const [sourceLoaded, setSourceLoaded] = useState(false);
  const [mapCreated, setMapCreated] = useState(false);
  const map = useRef<MapLibreMap | null>(null);
  const dispatch = useAppDispatch();
  const isMedium = useMediaQuery("(min-width: 897px)");

  // use this to manage popup and search state in the URL
  const [searchParams, setSearchParams] = useSearchParams(
    new window.URLSearchParams(),
  );
  const POPUP_ID_PARAM = "popupId";
  const SEARCH_QUERY_PARAM = "q";
  const DEVICE_ID_PARAM = "ref";

  const popupCreatedCallback = (itemIx: number) => {
    dispatch(openPopup(`@${itemIx}`));
  };

  const popupClosedCallback = () => {
    console.log("Popup closed in MapLibre");
    dispatch(closePopup());
  };

  useEffect(() => {
    if (configStatus !== "loaded") {
      console.log("Waiting for config to be loaded before creating map");
      return;
    }

    if (map.current) {
      try {
        map.current?.remove();
      } catch (error) {
        console.error("Error removing map instance:", error);
      }
      map.current = null;
    }

    map.current = createMap(
      popupCreatedCallback,
      popupClosedCallback,
      () => setMapCreated(true),
      mapConfig,
    );

    map.current.on("sourcedata", (e) => {
      if (e.isSourceLoaded && e.sourceId === "items-geojson") {
        console.log("Updated GeoJSON source");
        // We need to wait for the source to be initially loaded before we can update the data
        setSourceLoaded(true);
      }
    });
    dispatch(fetchLocations());

    // Clean up on unmount
    return () => {
      if (map.current) {
        try {
          map.current.remove();
        } catch (error) {
          console.error("Error removing map during component unmount:", error);
        }
      }
    };
  }, [configStatus]);

  useEffect(() => {
    if (sourceLoaded) {
      updateMapData().catch((error) => {
        console.error("Failed to update map data", error);
      });
    }
  }, [features, sourceLoaded]);

  // Keep the mapLibre popup and URL in sync with the Redux state (the latter being the source of truth)
  useEffect(() => {
    const urlPopupId = searchParams.get(POPUP_ID_PARAM) ?? "";
    const urlSearchQuery = searchParams.get(SEARCH_QUERY_PARAM) || "{}";

    // First let's update URL parameters if needed, in a single call to avoid conflicts
    if (
      mapCreated &&
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

    if (popupIsOpen) {
      console.log("Redux popup state is open");
      if (popupLocation) {
        map?.current?.fire("openPopup", {
          itemIx: popupIndex,
          location: popupLocation,
        });
      } else {
        console.log("Open popup for item with no location");
        map?.current?.fire("closeAllPopups");
        // The rest is handled in Popup.tsx
      }
    } else {
      console.log("Redux popup state is closed");
      map?.current?.fire("closeAllPopups");
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

    if (mapCreated) {
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
            dispatch(openPopup(urlPopupId));
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
  }, [mapCreated, searchParams]);

  useEffect(() => {
    // Keep the mapLibre panel open state in sync with the Redux state
    setPanelOpenValues(panelOpen, resultsPanelOpen);
  }, [panelOpen, resultsPanelOpen]);

  useEffect(() => {
    map.current?.fire("changeLanguage", { language });
  }, [language]);

  const updateMapData = async () => {
    if (isFilterActive) {
      console.log(`Found ${visibleIndexes?.length} items that matched`);
    }

    console.log(
      `Rendering ${features.length} items that have a location in MapLibreGL`,
      features,
    );

    (map.current?.getSource("items-geojson") as GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features,
    });

    // Auto-zoom to fit filtered results
    if (isFilterActive && features.length > 0 && map.current) {
      // Wait a brief moment for the map to process the new data before panning
      setTimeout(() => {
        if (map.current) {
          fitBoundsToFeatures(map.current);
        }
      }, 100);
    }

    if (!visibleIndexes.includes(popupIndex)) {
      dispatch(closePopup());
    }
  };

  return (
    <div
      id="map-container"
      className="absolute bottom-0 left-0 right-0 top-0 overflow-hidden text-center"
    />
  );
};

export default MapWrapper;
