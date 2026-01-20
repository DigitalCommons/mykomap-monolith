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
let popupIx: number | undefined;
let tooltip: Popup | undefined;
let colocatedClusterIds = new Set<number>();
let currentSpiderfiedClusterId: number | null = null;

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

/**
 * Update badge visibility to hide badges on spiderfied clusters
 */
const updateBadgeVisibility = (map: Map) => {
  const colocatedBadgeFilter = [
    "all",
    ["has", "point_count"],
    ["in", ["get", "cluster_id"], ["literal", Array.from(colocatedClusterIds)]],
    // Hide badge if this cluster is currently spiderfied
    ["!=", ["get", "cluster_id"], currentSpiderfiedClusterId ?? -1],
  ];
  map.setFilter("colocated-badge-circle", colocatedBadgeFilter as any);
  map.setFilter("colocated-badge-icon", colocatedBadgeFilter as any);
};

const openPopup = async (
  map: Map,
  itemIx: number,
  coordinates: LngLatLike,
  popupCreatedCallback: (itemIx: number) => void,
  popupClosedCallback: () => void,
  offset?: [number, number],
) => {
  if (popup?.isOpen() && popupIx === itemIx) {
    console.log(`Popup for item @${itemIx} already open`);
    return;
  }

  console.log(`Open popup for item @${itemIx} ${coordinates}`);

  // Shift the popup up a bit so it doesn't cover the marker
  const popupOffset: [number, number] = offset
    ? [offset[0], offset[1] - 20]
    : [0, -20];

  popup?.remove();
  popupIx = itemIx;
  popup = new Popup({
    closeButton: false,
    maxWidth: "none",
    anchor: "bottom",
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
  mapConfig?: {
    mapBounds?: [[number, number], [number, number]];
  },
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
        "text-allow-overlap": true, // Ensure text always shows
      },
    });

    // SVG icon for co-located badge
    const svg = `
      <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M6.29793.0680478c-.18751-.0907304-.40835-.0907304-.59586 0L.36845 2.64882c-.3291847.15929-.4625251.5464-.297933.86497.164592.31856.564613.4476.893798.28832L6 1.3665l5.0357 2.43561c.3292.15928.7292.03024.8938-.28832.1646-.31857.0312-.70568-.2979-.86497L6.29793.0680478ZM6 5.80624c.30944 0 .6062-.11896.825-.3307.21881-.21175.34173-.49894.34173-.79839 0-.29945-.12292-.58664-.34173-.79839-.2188-.21174-.51556-.3307-.825-.3307-.30944 0-.6062.11896-.825.3307-.21881.21175-.34173.49894-.34173.79839 0 .29945.12292.58664.34173.79839.2188.21174.51556.3307.825.3307Zm0 .96779c-1.10423 0-2.00011.86698-2.00011 1.93558v.6452c0 .35687.29794.64519.66671.64519h2.66681c.36876 0 .6667-.28832.6667-.64519v-.6452c0-1.0686-.89588-1.93558-2.00011-1.93558ZM3.33319 5.48364c0-.12709-.02587-.25294-.07612-.37035-.05026-.11742-.12392-.22411-.21679-.31398-.09286-.08987-.20311-.16115-.32444-.20979-.12133-.04863-.25137-.07367-.3827-.07367s-.26137.02504-.38271.07367c-.12133.04864-.23157.11992-.32444.20979-.09286.08987-.16652.19656-.21678.31398-.05026.11741-.07613.24326-.07613.37035 0 .1271.02587.25294.07613.37036.05026.11742.12392.22411.21678.31397.09287.08987.20311.16116.32444.2098.12134.04863.25138.07366.38271.07366s.26137-.02503.3827-.07366c.12133-.04864.23158-.11993.32444-.2098.09287-.08986.16653-.19655.21679-.31397.05025-.11742.07612-.24326.07612-.37036Zm7.33371 0c0-.25667-.1053-.50283-.2929-.68433-.1875-.18149-.44191-.28346-.70714-.28346-.26523 0-.5196.10197-.70714.28346-.18755.1815-.29291.42766-.29291.68433 0 .25668.10536.50284.29291.68433.18754.1815.44191.28346.70714.28346.26523 0 .51964-.10196.70714-.28346.1876-.18149.2929-.42765.2929-.68433ZM2.33314 7.09663c-.92088 0-1.666758.72181-1.666758 1.61298v.66737c0 .34276.287516.62302.643788.62302h1.82926c-.08959-.19759-.13959-.41534-.13959-.64519v-.96779c0-.37099.07292-.72585.20418-1.05248-.25418-.15121-.55212-.23791-.87088-.23791ZM8.86265 10h1.82925c.3542 0 .6438-.27824.6438-.62302v-.66737c0-.89117-.7459-1.61298-1.66675-1.61298-.31877 0-.6167.0867-.87088.23791.13125.32663.20417.68149.20417 1.05248v.96779c0 .22985-.05.4476-.13959.64519Z" 
          fill="#fff"
        />
      </svg>
    `;
    const img = new Image(12, 10);
    img.src = "data:image/svg+xml;base64," + btoa(svg);

    // Wait for image to load before adding the layer
    await new Promise<void>((resolve) => {
      img.onload = () => {
        map.addImage("colocated-icon", img);
        resolve();
      };
    });

    // Badge circle
    map.addLayer({
      id: "colocated-badge-circle",
      type: "circle",
      source: "items-geojson",
      filter: ["==", "cluster_id", -1], // Initially hide all badges
      paint: {
        "circle-radius": 10,
        "circle-color": "#535F6D",
        "circle-translate": [15, -15], // Offset to top-right of cluster
      },
    });

    // Badge icon
    map.addLayer({
      id: "colocated-badge-icon",
      type: "symbol",
      source: "items-geojson",
      filter: ["==", "cluster_id", -1], // Initially hide all badges
      layout: {
        "icon-image": "colocated-icon",
        "icon-size": 1,
        "icon-anchor": "center", // Center the icon
        "icon-allow-overlap": true,
        "icon-ignore-placement": true,
      },
      paint: {
        "icon-translate": [15, -16], // Use translate instead of offset for consistency
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
        const itemIx = feature.properties?.ix;

        if (popup?.isOpen() && popupIx === itemIx) {
          console.log(
            `Popup for item @${itemIx} already open so toggle closed`,
          );
          popup?.remove();
          popupIx = undefined;
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
              itemIx,
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

      // Get all leaves to check if co-located
      const allLeaves: GeoJSON.Feature<GeoJSON.Point>[] =
        (await source.getClusterLeaves(
          clusterFeature.properties?.cluster_id,
          Infinity,
          0,
        )) as GeoJSON.Feature<GeoJSON.Point>[];

      // Check if all points are at the same location
      const referenceCoord = allLeaves[0]?.geometry.coordinates;
      const isColocated = allLeaves.every(
        (leaf) =>
          leaf.geometry.coordinates[0] === referenceCoord[0] &&
          leaf.geometry.coordinates[1] === referenceCoord[1],
      );

      console.log(
        `Cluster has ${allLeaves.length} points, co-located: ${isColocated}`,
      );

      // Update the set of co-located cluster IDs
      const clusterId = clusterFeature.properties?.cluster_id;
      if (isColocated) {
        colocatedClusterIds.add(clusterId);
      } else {
        colocatedClusterIds.delete(clusterId);
      }

      // Track if this cluster will be spiderfied (at zoom 18)
      if (isColocated && map.getZoom() >= 17.5) {
        currentSpiderfiedClusterId = clusterId;
      } else if (map.getZoom() < 18) {
        currentSpiderfiedClusterId = null;
      }

      // Update badge visibility
      updateBadgeVisibility(map);

      const features: GeoJSON.Feature<GeoJSON.Point>[] =
        (await source.getClusterLeaves(
          clusterFeature.properties?.cluster_id,
          1,
          0,
        )) as GeoJSON.Feature<GeoJSON.Point>[];
      const clusterExpansionZoom = await source.getClusterExpansionZoom(
        clusterFeature.properties?.cluster_id,
      );

      // For co-located clusters, zoom by 3 levels to reach spiderfy faster
      if (isColocated && map.getZoom() < 18) {
        const targetZoom = Math.min(18, map.getZoom() + 3);
        console.log(
          `Co-located cluster: zooming from ${map.getZoom()} to ${targetZoom}`,
        );
        map.jumpTo({
          center: features[0].geometry.coordinates as LngLatLike,
          zoom: targetZoom,
        });
      } else if (map.getZoom() < 18 && clusterExpansionZoom <= 18) {
        // Regular cluster behavior
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
        const itemIx = feature.properties?.ix;

        if (popup?.isOpen() && popupIx === itemIx) {
          console.log(
            `Popup for item @${itemIx} already open so toggle closed`,
          );
          popup?.remove();
          popupIx = undefined;
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
              itemIx,
              coordinates as LngLatLike,
              popupCreatedCallback,
              popupClosedCallback,
            );
          });
      }
    });

    map.on("openPopup", async ({ itemIx, location }) => {
      if (popup?.isOpen() && popupIx === itemIx) return;

      if (location === null) {
        console.error("This shouldn't happen");
        return;
      }

      // Remove previous popup - remove listener to prevent looping back and confusing React code
      popup?.off("close", popupClosedCallback);
      popup?.remove();
      popupIx = undefined;
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
        itemIx,
        location,
        popupCreatedCallback,
        popupClosedCallback,
      );
    });

    map.on("closeAllPopups", () => {
      // The React code knows we're closing this popup - remove listener to prevent loop
      popup?.off("close", popupClosedCallback);
      popup?.remove();
      popupIx = undefined;
      popup = undefined;
    });

    map.on("zoomend", () => {
      console.log("Zoom level", map.getZoom());

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
      currentSpiderfiedClusterId = null;
      if (map.getLayer("colocated-badge-circle")) {
        updateBadgeVisibility(map);
      }
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
  });

  return map;
};
