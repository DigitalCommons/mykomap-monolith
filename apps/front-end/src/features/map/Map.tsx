import { useRef, useEffect } from "react";
import { createMap } from "./mapSetup";
import { useAppSelector } from "../../app/hooks";
import { selectSearch, selectVisibleIds } from "../filter/filterSlice";
import allFeatures, { filteredFeatures } from "../../data/geojson";
import { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";

const Map = () => {
  const search = useAppSelector(selectSearch);
  const visibleIds = useAppSelector(selectVisibleIds);
  const map = useRef<MapLibreMap | null>(null);

  useEffect(() => {
    map.current = createMap();

    // Clean up on unmount
    return () => map.current?.remove();
  }, []);

  useEffect(() => {
    let features;

    console.log(`Filtering features with IDs ${visibleIds}`);

    if (search) {
      features = filteredFeatures(visibleIds);
    } else {
      features = allFeatures;
    }

    console.log("Rendering data in MapLibreGL");

    (map.current?.getSource("initiatives-geojson") as GeoJSONSource)?.setData({
      type: "FeatureCollection",
      features,
    });
  }, [visibleIds]);

  return (
    <div
      id="map-container"
      className="absolute bottom-0 left-0 right-0 top-0 overflow-hidden text-center"
    />
  );
};

export default Map;
