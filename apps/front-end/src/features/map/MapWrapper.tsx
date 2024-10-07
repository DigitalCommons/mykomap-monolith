import { useRef, useEffect } from "react";
import { createMap } from "./mapSetup";
import { useAppSelector } from "../../app/hooks";
import { selectText, selectVisibleIds } from "../filter/filterSlice";
import featuresPromise, { getFilteredFeatures } from "../../data/geojson";
import { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";

const MapWrapper = () => {
  const searchText = useAppSelector(selectText);
  const visibleIds = useAppSelector(selectVisibleIds);
  const map = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    map.current = createMap();

    // Clean up on unmount
    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    updateMapData().catch((error) => {
      console.error("Failed to update map data", error);
    });
  }, [visibleIds]);

  const updateMapData = async () => {
    let features;

    if (searchText) {
      console.log(`Found ${visibleIds.length} features that matched`);
      features = await getFilteredFeatures(visibleIds);
    } else {
      features = await featuresPromise;
    }

    console.log("Rendering data in MapLibreGL");

    (map.current?.getSource("initiatives-geojson") as GeoJSONSource)?.setData({
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
