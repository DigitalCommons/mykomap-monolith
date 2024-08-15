import {
  Map as MapLibreMap,
  GeoJSONSource,
  LngLatLike,
  NavigationControl,
  Popup,
  MapLayerMouseEvent,
  MapGeoJSONFeature,
} from "maplibre-gl";
// @ts-ignore
import Spiderfy from "@nazka/map-gl-js-spiderfy";

import mapMarkerImgUrl from "./map-marker.png";

const baseUri = "https://base.uri/";
let popup: Popup | undefined;
let tooltip: Popup | undefined;
let geojsonSourceLoaded = false;

const generateGeoJSON = (
  pointCount: number,
): GeoJSON.FeatureCollection<GeoJSON.Point> => {
  const minLat = -90,
    rangeLat = 180,
    minLng = -180,
    rangeLng = 360;

  const features: GeoJSON.Feature<GeoJSON.Point>[] = Array.from(
    { length: pointCount },
    (_v, k) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [
          minLng + Math.random() * rangeLng,
          minLat + Math.random() * rangeLat,
        ],
      },
      properties: {
        Name: `Marker ${k}`,
        Identifier: (Math.random() + 1).toString(36).substring(7),
      },
    }),
  );

  // Duplicate some coordinates randomly so we can simulate spidering
  for (let i = 1; i < pointCount * 0.7; i++) {
    if (Math.random() < 0.8) {
      features[i].geometry.coordinates =
        features[i - 1].geometry.coordinates.slice();
    }
  }

  return {
    type: "FeatureCollection",
    features,
  };
};

const getPopup = (name: string): string => {
  return `
    <div class="m-0 flex flex-row h-56 w-[35vw] p-0">
      <div class="scrolling-touch max-h-100 w-2/3 overflow-y-auto rounded-md bg-white px-6 py-4">
        <h2 class="font-bold text-xl mb-1">${name}</h2>
      </div>
      
      <div class="flex-grow w-1/3 overflow-y-auto rounded-r-md bg-gray-200 px-6 py-4">
        <p class="font-light text-sm my-2 mx-0">Fetch other details with backend API...</p>
      </div>
    </div>
  `;
};

const getTooltip = (name: string): string =>
  `<div class="px-[0.75rem] py-2">${name}</div>`;

const disableRotation = (map: MapLibreMap) => {
  map.dragRotate.disable();
  map.keyboard.disable();
  map.touchZoomRotate.disableRotation();
};

const onMarkerClick = (
  map: MapLibreMap,
  feature: GeoJSON.Feature<GeoJSON.Point>,
  offset?: [number, number],
) => {
  const coordinates = feature.geometry.coordinates.slice() as LngLatLike;
  const identifier = feature.properties?.Identifier;
  const name = feature.properties?.Name;
  const uri = `${baseUri}${identifier}`;

  console.log(`Clicked initiative ${identifier} ${coordinates}`);
  const content = getPopup(name);
  // Shift the popup up a bit so it doesn't cover the marker
  const popupOffset: [number, number] = offset
    ? [offset[0], offset[1] - 20]
    : [0, -20];

  popup?.remove();
  popup = new Popup({
    closeButton: false,
    maxWidth: "none",
  })
    .setLngLat(coordinates)
    .setHTML(content)
    .addTo(map)
    .addClassName(`popup-uri-${uri}`)
    .setOffset(popupOffset);
};

const onMarkerHover = (
  map: MapLibreMap,
  feature: GeoJSON.Feature<GeoJSON.Point>,
  offset?: [number, number],
) => {
  const coordinates = feature.geometry.coordinates.slice() as LngLatLike;
  const name = feature.properties?.Name;

  // Shift the popup up a bit so it doesn't cover the marker
  const popupOffset: [number, number] = offset
    ? [offset[0], offset[1] - 20]
    : [0, -20];

  tooltip?.remove();
  tooltip = new Popup({
    closeButton: false,
    maxWidth: "none",
  })
    .setLngLat(coordinates)
    .setHTML(getTooltip(name))
    .addTo(map)
    .setOffset(popupOffset);

  map.getCanvas().style.cursor = "pointer";
};

/**
 * Set up the sources and layers of the MapLibreGL map instance.
 */
export const createMap = (): MapLibreMap => {
  const map = new MapLibreMap({
    container: "map-container",
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`,
    minZoom: 1.1,
    maxZoom: 18,
    bounds: [
      [-180, -59.9],
      [180, 78.1],
    ],
  });

  map.on("load", () => {
    map.addSource("initiatives-geojson", {
      type: "geojson",
      data: generateGeoJSON(500000),
      buffer: 0,
      cluster: true,
      clusterMaxZoom: 19,
      clusterRadius: 60,
    });

    map.on("sourcedata", (e) => {
      if (
        !geojsonSourceLoaded &&
        e.isSourceLoaded &&
        e.sourceId === "initiatives-geojson"
      ) {
        geojsonSourceLoaded = true;
        console.log("Added GeoJSON source");
      }
    });

    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "initiatives-geojson",
      filter: ["has", "point_count"],
      paint: {
        // Use step expressions (https://docs.mapbox.com/style-spec/reference/expressions/#step)
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
    });

    map.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "initiatives-geojson",
      filter: ["has", "point_count"],
      layout: {
        "text-field": ["get", "point_count_abbreviated"],
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
    });

    map.loadImage(mapMarkerImgUrl).then((image) => {
      map.addImage("custom-marker", image.data);
    });

    map.addLayer({
      id: "unclustered-point",
      type: "symbol",
      source: "initiatives-geojson",
      filter: ["!", ["has", "point_count"]],
      layout: {
        "icon-image": "custom-marker",
        "icon-offset": [0, -20], // shift marker icon up so tip is at the marker's coordinates
      },
    });

    const spiderfy = new Spiderfy(map, {
      onLeafClick: (
        feature: GeoJSON.Feature<GeoJSON.Point>,
        e: MapLayerMouseEvent,
        leafOffset: [number, number],
      ) => {
        onMarkerClick(map, feature, leafOffset);
      },
      onLeafHover: (
        feature: GeoJSON.Feature<GeoJSON.Point>,
        e: MapLayerMouseEvent,
        leafOffset: [number, number] | undefined,
      ) => {
        if (feature) {
          onMarkerHover(map, feature, leafOffset);
        } else {
          tooltip?.remove();
          map.getCanvas().style.cursor = "";
        }
      },
      minZoomLevel: 18,
      zoomIncrement: 0,
      closeOnLeafClick: false,
      spiderLeavesLayout: {
        "icon-image": "custom-marker",
      },
    });
    spiderfy.applyTo("clusters");

    // inspect a cluster on click
    map.on("click", "clusters", async (e) => {
      const clusterFeature: GeoJSON.Feature<GeoJSON.Point> =
        map.queryRenderedFeatures(e.point, {
          layers: ["clusters"],
        })[0] as GeoJSON.Feature<GeoJSON.Point>;

      const source = map.getSource("initiatives-geojson") as GeoJSONSource;
      const features: GeoJSON.Feature<GeoJSON.Point>[] =
        (await source.getClusterLeaves(
          clusterFeature.properties?.cluster_id,
          1,
          0,
        )) as GeoJSON.Feature<GeoJSON.Point>[];
      const zoom = await source.getClusterExpansionZoom(
        clusterFeature.properties?.cluster_id,
      );

      map.flyTo({
        center: features[0].geometry.coordinates as LngLatLike,
        zoom: zoom ?? undefined,
        speed: 1.5,
      });
    });

    // When a click event occurs on a feature in the unclustered-point layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on("click", "unclustered-point", (e: MapLayerMouseEvent) => {
      if (e.features) {
        const feature = e.features[0] as GeoJSON.Feature<GeoJSON.Point>;
        onMarkerClick(map, feature);
      }
    });

    map.on("zoomend", () => {
      // console.log("Zoom level", map.getZoom());

      if (popup?.isOpen()) {
        const uri = Array.from(popup?._container.classList)
          .find((c: any) => c.startsWith("popup-uri-"))
          ?.replace("popup-uri-", "");
        const visibleFeatureUris = map
          .queryRenderedFeatures(undefined, {
            layers: ["unclustered-point"],
          })
          .map((f) => `${baseUri}${f?.properties["Identifier"]}`);

        if (!uri || !visibleFeatureUris.includes(uri)) {
          // close the popup if the feature is no longer visible
          popup.remove();
        }
      }
    });

    map.on("zoomstart", () => {
      spiderfy.unspiderfyAll();
    });

    map.on("mouseenter", "clusters", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("mouseenter", "unclustered-point", (e: any) => {
      const feature = e.features[0];
      onMarkerHover(map, feature);
    });
    map.on("mouseleave", "unclustered-point", () => {
      tooltip?.remove();
      map.getCanvas().style.cursor = "";
    });
  });

  map.addControl(new NavigationControl(), "bottom-right");
  disableRotation(map);

  return map;
};