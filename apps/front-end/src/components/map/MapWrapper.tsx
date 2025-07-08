import { useRef, useEffect, useState } from "react";
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
  // const [configLoaded, setConfigLoaded] = useState(false);
  const configStatus = useAppSelector(selectConfigStatus);
  const [sourceLoaded, setSourceLoaded] = useState(false);
  const map = useRef<MapLibreMap | null>(null);
  const dispatch = useAppDispatch();

  // Check if mapBounds are loaded from config
  useEffect(() => {
    // These values shouldn't be hardcoded, but are used to check if the config is loaded from the server
    // This is a temporary solution to check if the config is loaded from the server
    // const isConfigFromServer =
    //   mapConfig?.mapBounds?.[0][0] !== -169 ||
    //   mapConfig?.mapBounds?.[0][1] !== -49.3;

    // if (isConfigFromServer) {
    //   console.log("Config loaded from server:", mapConfig);
    //   setConfigLoaded(true);
    // }
    if (configStatus === "loaded") {
      console.log("Config loaded from server:", mapConfig);
    }
  }, [mapConfig, configStatus]);

  const popupCreatedCallback = (itemIx: number) => {
    console.log("Popup created");
    dispatch(openPopup(itemIx));
  };

  const popupClosedCallback = () => {
    console.log("Popup closed");
    dispatch(closePopup());
  };

  useEffect(() => {
     if (configStatus !== "loaded") {
       console.log("Waiting for config to be loaded before creating map");
       return;
     }

    if (map.current) {
      try {
        console.log("Destroying existing map to recreate with new config");
        map.current?.remove();
      } catch (error) {
        console.error("Error removing map:", error);
      }
      map.current = null;
    }

    map.current = createMap(
      popupCreatedCallback,
      popupClosedCallback,
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
    console.log("mapConfig in MapWrapper", mapConfig);
    // Clean up on unmount
    return () => map.current?.remove();
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
