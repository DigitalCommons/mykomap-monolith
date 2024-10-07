import { useRef, useEffect, useState } from "react";
import { createMap } from "./mapLibre";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { selectText, selectVisibleIds } from "../filter/filterSlice";
import { Map as MapLibreMap, GeoJSONSource } from "maplibre-gl";
import { fetchData, selectFeatures } from "./mapSlice";

const MapWrapper = () => {
  const searchText = useAppSelector(selectText);
  // If there is no search text, visible IDs is undefined to show all features
  const visibleIds = useAppSelector(selectVisibleIds);
  const features = useAppSelector((state) =>
    selectFeatures(state, searchText ? visibleIds : undefined),
  );
  const [sourceLoaded, setSourceLoaded] = useState(false);
  const map = useRef<MapLibreMap | null>(null);
  const dispatch = useAppDispatch();

  useEffect(() => {
    map.current = createMap();
    map.current.on("sourcedata", (e) => {
      if (e.isSourceLoaded && e.sourceId === "initiatives-geojson") {
        console.log("Updated GeoJSON source");
        // We need to wait for the source to be initially loaded before we can update the data
        setSourceLoaded(true);
      }
    });
    dispatch(fetchData());

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
    if (searchText) {
      console.log(`Found ${visibleIds?.length} features that matched`);
    }

    console.log("Rendering data in MapLibreGL", features);

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
