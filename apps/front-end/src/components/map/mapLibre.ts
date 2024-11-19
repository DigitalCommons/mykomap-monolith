import * as MapLibreGL from "maplibre-gl";
import { AttributionControl, NavigationControl, Popup } from "maplibre-gl";
import type {
  Map,
  GeoJSONSource,
  LngLatLike,
  MapLayerMouseEvent,
} from "maplibre-gl";
import Spiderfy from "@nazka/map-gl-js-spiderfy";
import mapMarkerImgUrl from "./map-marker.png";
import { getLanguageFromUrl } from "../../utils/window-utils";

export const POPUP_CONTAINER_ID = "popup-container";

let popup: Popup | undefined;
let tooltip: Popup | undefined;

const getTooltip = (name: string): string =>
  `<div class="px-[0.75rem] py-2">${name}</div>`;

const disableRotation = (map: Map) => {
  map.dragRotate.disable();
  map.keyboard.disable();
  map.touchZoomRotate.disableRotation();
};

const openPopup = async (
  map: Map,
  itemIx: number,
  coordinates: LngLatLike,
  popupCreatedCallback: (itemIx: number) => void,
  popupClosedCallback: () => void,
  offset?: [number, number],
) => {
  console.log(`Clicked item @${itemIx} ${coordinates}`);

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
    .setHTML(`<div id=${POPUP_CONTAINER_ID}></div>`)
    .addTo(map)
    .addClassName(`popup-ix-${itemIx}`)
    .setOffset(popupOffset)
    .on("close", popupClosedCallback);

  popupCreatedCallback(itemIx);
};

const onMarkerHover = (
  map: Map,
  feature: GeoJSON.Feature<GeoJSON.Point>,
  offset?: [number, number],
) => {
  // TODO: add support for tooltips
  // const coordinates = feature.geometry.coordinates.slice() as LngLatLike;
  // const name = feature.properties?.Name;
  // // Shift the tooltip up a bit so it doesn't cover the marker
  // const popupOffset: [number, number] = offset
  //   ? [offset[0], offset[1] - 20]
  //   : [0, -20];
  // tooltip?.remove();
  // tooltip = new Popup({
  //   closeButton: false,
  //   maxWidth: "none",
  // })
  //   .setLngLat(coordinates)
  //   .setHTML(getTooltip(name))
  //   .addTo(map)
  //   .setOffset(popupOffset);
};

/**
 * Set up the sources and layers of the MapLibreGL map instance.
 */
export const createMap = (
  popupCreatedCallback: (itemIx: number) => void,
  popupClosedCallback: () => void,
): Map => {
  const map = new MapLibreGL.Map({
    container: "map-container",
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`,
    minZoom: 1.3,
    maxZoom: 18,
    bounds: [
      [-180, -59.9],
      [180, 78.1],
    ],
    attributionControl: false,
  });

  map.on("load", () => {
    map.addSource("items-geojson", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
      buffer: 0,
      cluster: true,
      clusterMaxZoom: 19,
      clusterRadius: 60,
    });

    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "items-geojson",
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
      source: "items-geojson",
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
      source: "items-geojson",
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
        const coordinates = feature.geometry.coordinates.slice() as LngLatLike;
        const itemIx = feature.properties?.ix;
        openPopup(
          map,
          itemIx,
          coordinates,
          popupCreatedCallback,
          popupClosedCallback,
          leafOffset,
        );
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

      const source = map.getSource("items-geojson") as GeoJSONSource;
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
        const coordinates = feature.geometry.coordinates.slice() as LngLatLike;
        const itemIx = feature.properties?.ix;
        openPopup(
          map,
          itemIx,
          coordinates,
          popupCreatedCallback,
          popupClosedCallback,
        );
      }
    });

    map.on("openPopup", ({ itemIx }) => {
      const features = map
        .queryRenderedFeatures(undefined, {
          layers: ["unclustered-point"],
        })
        .filter((f) => f?.properties?.ix === itemIx);

      if (features.length > 0) {
        const feature = features[0] as GeoJSON.Feature<GeoJSON.Point>;
        const coordinates = feature.geometry.coordinates.slice() as LngLatLike;
        openPopup(
          map,
          itemIx,
          coordinates,
          popupCreatedCallback,
          popupClosedCallback,
        );
      } else {
        console.error(`Feature @${itemIx} not visible`);
        popup?.remove();
      }
    });

    map.on("closeAllPopups", () => {
      popup?.remove();
    });

    map.on("zoomend", () => {
      // console.log("Zoom level", map.getZoom());

      if (popup?.isOpen()) {
        const ix = Array.from(popup?._container.classList)
          .find((c: any) => c.startsWith("popup-ix-"))
          ?.replace("popup-ix-", "");
        const visibleFeatureIxs = map
          .queryRenderedFeatures(undefined, {
            layers: ["unclustered-point"],
          })
          .map((f) => f?.properties?.ix);

        if (!ix || !visibleFeatureIxs.includes(ix)) {
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
      map.getCanvas().style.cursor = "pointer";
      // const feature = e.features[0];
      // onMarkerHover(map, feature);
    });
    map.on("mouseleave", "unclustered-point", () => {
      tooltip?.remove();
      map.getCanvas().style.cursor = "";
    });

    map.on("changeLanguage", ({ language }) => {
      const oldStyle = map.getStyle();
      const newStyle = JSON.stringify(oldStyle, (key, val) => {
        if (typeof val === "string") {
          return val.replaceAll("name:en", `name:${language.toLowerCase()}`);
        }
        return val;
      });
      map.setStyle(JSON.parse(newStyle));
      console.log("Set MapLibre GL language to", language);
    });

    map.fire("changeLanguage", { language: getLanguageFromUrl() });

    map.addControl(new AttributionControl(), "top-right");
    map.addControl(new NavigationControl(), "top-right");
    disableRotation(map);
  });

  return map;
};
