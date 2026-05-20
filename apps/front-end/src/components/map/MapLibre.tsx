import { useEffect, useState, useRef } from "react";
import Map from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY;

export default function MapLibre({ mapBounds }) {
  return (
    <Map
      initialViewState={{
        bounds: mapBounds,
      }}
      minZoom={1.45}
      maxZoom={18}
      attributionControl={false}
      style={{ width: "100%", height: "100vh" }}
      mapStyle={`https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`}
    />
  );
}
