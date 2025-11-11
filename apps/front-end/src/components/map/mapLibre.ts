import * as MapLibreGL from "maplibre-gl";
import {
  AttributionControl,
  NavigationControl,
  Popup,
  AddLayerObject,
  DataDrivenPropertyValueSpecification,
} from "maplibre-gl";
import type {
  Map,
  GeoJSONSource,
  LngLatLike,
  MapLayerMouseEvent,
} from "maplibre-gl";
import Spiderfy from "@nazka/map-gl-js-spiderfy";
import { getLanguageFromUrl } from "../../utils/window-utils";
import markers from "./markers";

export const POPUP_CONTAINER_ID = "popup-container";

/** The level to which we zoom when jumping to a popup, on clicking a search result */
const POPUP_INITIAL_ZOOM = 15;

let popup: Popup | undefined;
let popupId: string | undefined;
let tooltip: Popup | undefined;

/**
 * We need to offset latitude of the map centre slightly above a marker's location when opening a
 * popup so that it can be fully seen. I've calcluated that this exponential function gives a good
 * offset.
 */
const getMapCentreLatOffsetted = (lat: number, zoom: number) =>
  Math.min(90, lat + 87 * Math.exp(-0.704 * zoom));

const isLocationNear = (location: [number, number], map: Map) => {
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

const getTooltip = (name: string): string =>
  `<div class="px-[0.75rem] py-2">${name}</div>`;

const disableRotation = (map: Map) => {
  map.dragRotate.disable();
  map.keyboard.disable();
  map.touchZoomRotate.disableRotation();
};

const openPopup = async (
  map: Map,
  itemId: string,
  coordinates: LngLatLike,
  popupCreatedCallback: (itemId: string) => void,
  popupClosedCallback: () => void,
  offset?: [number, number],
) => {
  if (popup?.isOpen() && popupId === itemId) {
    console.log(`Popup for item ${itemId} already open`);
    return;
  }

  console.log(`Open popup for item ${itemId} ${coordinates}`);

  // Shift the popup up a bit so it doesn't cover the marker
  const popupOffset: [number, number] = offset
    ? [offset[0], offset[1] - 20]
    : [0, -20];

  popup?.remove();
  popupId = itemId;
  popup = new Popup({
    closeButton: false,
    maxWidth: "none",
    anchor: "bottom",
  })
    .setLngLat(coordinates)
    .setHTML(`<div id=${POPUP_CONTAINER_ID}></div>`)
    .addTo(map)
    .addClassName(`popup-ix-${itemId}`)
    .setOffset(popupOffset)
    .on("close", popupClosedCallback);

  popupCreatedCallback(itemId);
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
  popupCreatedCallback: (id: string) => void,
  popupClosedCallback: () => void,
  mapCreated: () => void,
  mapConfig?: {
    mapBounds?: [[number, number], [number, number]];
  }
): Map => {
  const initialBounds = mapConfig?.mapBounds;

  console.log("Map bounds", initialBounds);

  const map = new MapLibreGL.Map({
    container: "map-container",
    style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`,
    minZoom: 1.45,
    maxZoom: 18,
    bounds: initialBounds,
    attributionControl: false,
  });

  map.on("load", async () => {
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

    const markerList = [];
    let index = 0;

    for (let markerImage of markers) {
      const image = await map.loadImage(markerImage);
      const markerName = "marker-" + index;
      map.addImage(markerName, image.data);
      markerList.push(index++);
      markerList.push(markerName);
    }

    const markerLayout = {
      "icon-image": [
        "match",
        ["get", "custom_marker_id"],
        ...markerList,
        `marker-${markers.length - 1}`, // assumes the final marker in the marker list is the default marker
      ],
      "icon-anchor": "bottom",
    };

    map.addLayer({
      id: "unclustered-point",
      type: "symbol",
      source: "items-geojson",
      filter: ["!", ["has", "point_count"]],
      layout:
        markerLayout as unknown as DataDrivenPropertyValueSpecification<string>,
    } as AddLayerObject);

    const spiderfy = new Spiderfy(map, {
      onLeafClick: (
        feature: GeoJSON.Feature<GeoJSON.Point>,
        e: MapLayerMouseEvent,
        leafOffset: [number, number],
      ) => {
        const coordinates = feature.geometry.coordinates.slice();
        const itemId = feature.properties?.id;

        if (popup?.isOpen() && popupId === itemId) {
          console.log(
            `Popup for item ${itemId} already open so toggle closed`,
          );
          popup?.remove();
          popupId = undefined;
          popup = undefined;
          return;
        }

        map
          .easeTo({
            center: [
              coordinates[0],
              getMapCentreLatOffsetted(coordinates[1], map.getZoom()),
            ],
          })
          .once("moveend", () => {
            openPopup(
              map,
              itemId,
              coordinates as LngLatLike,
              popupCreatedCallback,
              popupClosedCallback,
              leafOffset,
            );
          });
      },
      onLeafHover: (
        feature: GeoJSON.Feature<GeoJSON.Point>,
        e: MapLayerMouseEvent,
        leafOffset: [number, number] | undefined,
      ) => {
        if (feature) {
          onMarkerHover(map, feature, leafOffset);
          map.getCanvas().style.cursor = "pointer";
        } else {
          tooltip?.remove();
          map.getCanvas().style.cursor = "";
        }
      },
      minZoomLevel: 18,
      zoomIncrement: 0,
      closeOnLeafClick: false,
      spiderLeavesLayout:
        markerLayout as unknown as DataDrivenPropertyValueSpecification<string>,
    });
    spiderfy.applyTo("clusters");

    type ClusterClickEvent = MapLibreGL.MapMouseEvent & {
      itemIx?: number;
      openPopupRecursive?: boolean;
    };
    // inspect a cluster on click
    map.on("click", "clusters", async (e: ClusterClickEvent) => {
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
      const clusterExpansionZoom = await source.getClusterExpansionZoom(
        clusterFeature.properties?.cluster_id,
      );

      if (map.getZoom() < 18 && clusterExpansionZoom <= 18) {
        map.jumpTo({
          center: features[0].geometry.coordinates as LngLatLike,
          zoom: clusterExpansionZoom ?? undefined,
        });
      }

      //this click came from the flyToAndOpenPopupRecursive function
      if (e.openPopupRecursive) {
        const { leaves } = spiderfy.spiderifiedCluster;

        const index = leaves.findIndex(
          (leaf: any) => leaf.properties.ix === e.itemIx,
        );

        const totalPoints = leaves.length;

        const theta = (Math.PI * 2) / totalPoints;
        const angle = theta * index;

        const legLength =
          totalPoints <= 10 ? 50 : 50 + (index * (Math.PI * 2 * 2.2)) / angle;
        const x = legLength * Math.cos(angle);
        const y = legLength * Math.sin(angle);

        /*
        openPopup(
          map,
          e.itemIx as number,
          e.lngLat,
          popupCreatedCallback,
          popupClosedCallback,
          [x, y],
        );*/
      }
    });

    // When a click event occurs on a feature in the unclustered-point layer, open a popup at the
    // location of the feature, with description HTML from its properties.
    map.on("click", "unclustered-point", (e: MapLayerMouseEvent) => {
      if (e.features) {
        const feature = e.features[0] as GeoJSON.Feature<GeoJSON.Point>;
        const coordinates = feature.geometry.coordinates.slice();
        const itemId = feature.properties ? `@${feature.properties.ix}` : "-1";

        if (popup?.isOpen() && popupId === itemId) {
          console.log(
            `Popup for item @${itemId} already open so toggle closed`,
          );
          popup?.remove();
          popupId = undefined;
          popup = undefined;
          return;
        }

        // ease to a position so that the popup is fully visible
        map
          .easeTo({
            center: [
              coordinates[0],
              getMapCentreLatOffsetted(coordinates[1], map.getZoom()),
            ],
          })
          .once("moveend", () => {
            openPopup(
              map,
              itemId,
              coordinates as LngLatLike,
              popupCreatedCallback,
              popupClosedCallback,
            );
          });
      }
    });

    map.on("openPopup", async ({ itemId, location }) => {
      if (popup?.isOpen() && popupId === itemId) return;

      if (location === null) {
        console.error("This shouldn't happen");
        return;
      }

      // Remove previous popup - remove listener to prevent looping back and confusing React code
      popup?.off("close", popupClosedCallback);
      popup?.remove();
      popupId = undefined;
      popup = undefined;

      if (isLocationNear(location, map)) {
        map.panTo([
          location[0],
          getMapCentreLatOffsetted(location[1], map.getZoom()),
        ]);
      } else {
        map.jumpTo({
          center: [
            location[0],
            getMapCentreLatOffsetted(location[1], POPUP_INITIAL_ZOOM),
          ],
          zoom: POPUP_INITIAL_ZOOM,
        });
      }

      openPopup(
        map,
        itemId,
        location,
        popupCreatedCallback,
        popupClosedCallback,
      );
    });

    map.on("closeAllPopups", () => {
      // The React code knows we're closing this popup - remove listener to prevent loop
      popup?.off("close", popupClosedCallback);
      popup?.remove();
      popupId = undefined;
      popup = undefined;
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

    map.on("moveend", () => {
      // console.debug("zoom / bounds", map.getZoom(), map.getBounds());
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
    // Cursor pointer on spiderfied cluster
    map.on("mouseenter", "spiderfied-cluster", () => {
      map.getCanvas().style.cursor = "pointer";
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

    map.addControl(new AttributionControl({ compact: true }), "top-right");
    map.addControl(new NavigationControl(), "top-right");
    disableRotation(map);

    mapCreated();
  });

  return map;
};
