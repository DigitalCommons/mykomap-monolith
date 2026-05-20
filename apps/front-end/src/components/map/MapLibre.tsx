import { useEffect, useState, useRef } from "react";
import Map, {
  NavigationControl,
  AttributionControl,
  Source,
  Layer,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY;

const clusterLayer = {
  id: "clusters",
  type: "circle",
  source: "points",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#51bbd6",
      100,
      "#f1f075",
      750,
      "#f28cb1",
    ],
    "circle-radius": 20,
  },
};

const clusterCountLayer = {
  id: "cluster-count",
  type: "symbol",
  source: "points",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-size": 12,
  },
};

export default function MapLibre({ mapBounds, features, markerIcons }) {
  const mapRef = useRef(null);
  const [markerLayout, setMarkerLayout] = useState();
  console.log(features);
  console.log(markerIcons);

  async function loadMarkerIcons() {
    if (mapRef.current) {
      let index = 0;
      let markerList: (string | number)[] = [];

      for (let marker of markerIcons) {
        const image = await mapRef.current.loadImage(
          `./assets/markers/${marker}.png`,
        );
        const markerName = "marker-" + index;
        mapRef.current.addImage(markerName, image.data);
        markerList.push(index++);
        markerList.push(markerName);
      }

      setMarkerLayout({
        "icon-image": [
          "match",
          ["get", "custom_marker_id"],
          ...markerList,
          `marker-${markerIcons.length - 1}`, // assumes the final marker in the marker list is the default marker
        ],
        "icon-anchor": "bottom",
      });
    }
  }

  useEffect(() => {
    loadMarkerIcons();
  }, [markerIcons, mapRef.current]);

  const unclusteredLayer = markerLayout && {
    id: "unclustered-point",
    type: "symbol",
    source: "points",
    filter: ["!", ["has", "point_count"]],
    layout: markerLayout,
  };

  return (
    <Map
      initialViewState={{
        bounds: mapBounds,
      }}
      ref={mapRef}
      minZoom={1.45}
      maxZoom={18}
      attributionControl={false}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
      }}
      mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`}
    >
      <AttributionControl position="top-right" compact />
      <NavigationControl position="top-right" />
      <Source
        id="points"
        type="geojson"
        data={{
          type: "FeatureCollection",
          features: features,
        }}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={50}
      >
        <Layer {...clusterLayer} />
        <Layer {...clusterCountLayer} />
        <Layer {...unclusteredLayer} />
      </Source>
    </Map>
  );
}
