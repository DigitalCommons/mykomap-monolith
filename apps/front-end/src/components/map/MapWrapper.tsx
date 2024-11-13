import { useRef, useEffect, useState } from "react";
import { createMap } from "./mapLibre";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectIsFilterActive,
  selectVisibleIndexes,
} from "../panel/searchPanel/searchSlice";
import { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
import { fetchLocations, selectFeatures } from "./mapSlice";
import { closePopup, openPopup } from "../popup/popupSlice";

const MapWrapper = () => {
  const isFilterActive = useAppSelector(selectIsFilterActive);
  // If there is no filter active , visible indexes is undefined to show all features
  const visibleIndexes = useAppSelector(selectVisibleIndexes);
  const features = useAppSelector((state) =>
    selectFeatures(state, isFilterActive ? visibleIndexes : undefined),
  );
  const [sourceLoaded, setSourceLoaded] = useState(false);
  const map = useRef<MapLibreMap | null>(null);
  const dispatch = useAppDispatch();

  const popupCreatedCallback = (itemIx: number) => {
    console.log("Popup created");
    dispatch(openPopup(itemIx));
  };

  const popupClosedCallback = () => {
    console.log("Popup closed");
    dispatch(closePopup());
  };

  useEffect(() => {
    map.current = createMap(popupCreatedCallback, popupClosedCallback);
    map.current.on("sourcedata", (e) => {
      if (e.isSourceLoaded && e.sourceId === "items-geojson") {
        console.log("Updated GeoJSON source");
        // We need to wait for the source to be initially loaded before we can update the data
        setSourceLoaded(true);
      }
    });
    dispatch(fetchLocations());

    // Clean up on unmount
    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    if (sourceLoaded) {
      updateMapData().catch((error) => {
        console.error("Failed to update map data", error);
      });
    }
  }, [features, sourceLoaded]);

  const updateMapData = async () => {
    if (isFilterActive) {
      console.log(`Found ${visibleIndexes?.length} features that matched`);
    }

    console.log(`Rendering ${features.length} points in MapLibreGL`);

    (map.current?.getSource("items-geojson") as GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features,
    });
  };

  return (
    <div
      id="map-container"
      className="absolute bottom-0 left-0 right-0 top-0 overflow-hidden text-center"
    />
  );
};

export default MapWrapper;
