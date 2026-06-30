import { MapRef } from "react-map-gl/maplibre";

const POPUP_INITIAL_ZOOM = 15;

export const fitBoundsToFeatures = (
  features: GeoJSON.Feature[],
  mapCenterOffsetPixels: [number, number],
) => {
  // Compute the bounding box of all features
  let minLng = 180;
  let maxLng = -180;
  let minLat = 90;
  let maxLat = -90;

  // Add padding around the bounds in px so that markers are not at the very edge of the screen
  const basePadding = 150;
  const leftPadding = basePadding + mapCenterOffsetPixels[0] * 2;

  if (features.length === 1) {
    const feature = features[0];
    console.log(feature.geometry.type);
    if (feature.geometry.type !== "Point") {
      return;
    }
    const [lng, lat] = feature.geometry.coordinates;
    return {
      minLng: lng,
      minLat: lat,
      maxLng: lng,
      maxLat: lat,
      basePadding,
      leftPadding,
      maxZoom: POPUP_INITIAL_ZOOM,
    };
  }

  for (const feature of features) {
    console.log(feature.geometry.type);
    if (feature.geometry.type !== "Point") {
      continue;
    }
    const [lng, lat] = feature.geometry.coordinates;
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  }

  return {
    minLng,
    minLat,
    maxLng,
    maxLat,
    basePadding,
    leftPadding,
    maxZoom: POPUP_INITIAL_ZOOM,
  };
};

export const isLocationNear = (location: [number, number], map: MapRef) => {
  const currentZoom = map.getZoom();
  if (currentZoom < POPUP_INITIAL_ZOOM) {
    return false; // too far out to be considered "near", marker is likely to be clustered
  }

  const { _sw, _ne } = map.getBounds();
  const lngMargin = (_ne.lng - _sw.lng) / 2;
  const latMargin = (_ne.lat - _sw.lat) / 2;

  const nearBox = {
    swLng: _sw.lng - lngMargin,
    swLat: _sw.lat - latMargin,
    neLng: _ne.lng + lngMargin,
    neLat: _ne.lat + latMargin,
  };

  return (
    nearBox.swLng <= location[0] &&
    nearBox.swLat <= location[1] &&
    nearBox.neLng >= location[0] &&
    nearBox.neLat >= location[1]
  );
};
