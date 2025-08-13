import { useRef, useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { createMap } from "./mapLibre";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectIsFilterActive,
  selectVisibleIndexes,
} from "../panel/searchPanel/searchSlice";
import { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
import { fetchLocations, selectFeatures, selectLocation } from "./mapSlice";
import {
  closePopup,
  openPopup,
  selectPopupIndex,
  selectPopupIsOpen,
} from "../popup/popupSlice";
import { selectCurrentLanguage } from "../../app/configSlice";
import { selectMapConfig, selectConfigStatus } from "../../app/configSlice";

const MapWrapper = () => {
  const isFilterActive = useAppSelector(selectIsFilterActive);
  // If there is no filter active , visible indexes is undefined to show all features
  const visibleIndexes = useAppSelector(selectVisibleIndexes);
  const features = useAppSelector((state) =>
    selectFeatures(state, isFilterActive ? visibleIndexes : undefined),
  );
  const popupIsOpen = useAppSelector(selectPopupIsOpen);
  const popupIndex = useAppSelector(selectPopupIndex);
  const popupLocation = useAppSelector(selectLocation(popupIndex));
  const language = useAppSelector(selectCurrentLanguage);
  const mapConfig = useAppSelector(selectMapConfig);
  const configStatus = useAppSelector(selectConfigStatus);
  const [sourceLoaded, setSourceLoaded] = useState(false);
  const [mapCreated, setMapCreated] = useState(false);
  const map = useRef<MapLibreMap | null>(null);
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams(new window.URLSearchParams());

  const popupCreatedCallback = (itemIx: number) => {
    console.log("Popup created");
    dispatch(openPopup(itemIx));
    searchParams.set("popupId", `${itemIx}`);
    setSearchParams(searchParams);
  };

  const popupClosedCallback = () => {
    console.log("Popup closed");
    dispatch(closePopup());
    searchParams.delete("popupId");
    setSearchParams(searchParams);
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
      mapConfig
    );

    map.current.on("sourcedata", (e) => {
      if (e.isSourceLoaded && e.sourceId === "items-geojson") {
        console.log("Updated GeoJSON source");
        // We need to wait for the source to be initially loaded before we can update the data
        setSourceLoaded(true);
      }
    });
    dispatch(fetchLocations())

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

  useEffect(() => {
    // Keep the mapLibre popup in sync with the Redux state
    if (popupIsOpen) {
      console.log("Opening popup");
      if (popupLocation) {
        map?.current?.fire("openPopup", {
          itemIx: popupIndex,
          location: popupLocation,
        });
      } else {
        console.log("Open popup for item with no location");
        map?.current?.fire("closeAllPopups");
        // This is handled in Popup.tsx
      }
    } else {
      console.log("Closing popup");
      map?.current?.fire("closeAllPopups");
    }
  }, [popupIsOpen, popupIndex]);

  useEffect(() => {
    map.current?.fire("changeLanguage", { language });
  }, [language]);

  useEffect(() => {
    const itemIx = searchParams.get("popupId");
    if (itemIx && mapCreated) {
      dispatch(openPopup(parseInt(itemIx)));
    }

  }, [searchParams, mapCreated])

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
