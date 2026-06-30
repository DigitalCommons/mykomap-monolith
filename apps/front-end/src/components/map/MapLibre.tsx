import { useEffect, useState, useMemo } from "react";
import Map, {
  NavigationControl,
  AttributionControl,
  Source,
  Layer,
  MapLayerMouseEvent,
  Popup as PopupContainer,
  StyleSpecification,
  MapRef,
  LayerProps,
  LngLatBoundsLike,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import Popup from "../popup/Popup";
import { fitBoundsToFeatures, isLocationNear } from "../../utils/map-utils";
import {
  getDatasetId,
  encodeBase64,
  resolveAssetUrl,
} from "../../utils/window-utils";
import { getDatasetItem } from "../../services";
import { Feature, Point, GeoJsonProperties, Position } from "geojson";
import { Offset } from "maplibre-gl";

export interface MapLibreProps {
  language: string;
  mapBounds: LngLatBoundsLike | undefined;
  features: Feature<Point, GeoJsonProperties>[];
  markerIcons: string[] | undefined;
  popupCreatedCallback: (itemIx: number) => void;
  popupClosedCallback: () => void;
  popupIndex: number;
  popupLocation: [number, number] | null;
  popupOrigin: "map" | "directory";
  mapCenterOffsetPixels: [number, number];
  mapRef: React.RefObject<MapRef | null>;
  mapLoadedCallback: () => void;
}

const getMapCentreLatOffsetted = (lat: number, zoom: number) =>
  Math.min(90, lat + 87 * Math.exp(-0.704 * zoom));

const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY;
const STYLE_URL = `https://api.maptiler.com/maps/streets-v2/style.json?key=${mapTilerKey}`;
const CLUSTER_LAYER_ID = "clusters";
const UNCLUSTERED_LAYER_ID = "unclustered-point";

export default function MapLibre({
  language,
  mapBounds,
  features,
  markerIcons,
  popupCreatedCallback,
  popupClosedCallback,
  popupIndex,
  popupLocation,
  popupOrigin,
  mapCenterOffsetPixels,
  mapRef,
  mapLoadedCallback,
}: MapLibreProps) {
  const [markerLayout, setMarkerLayout] = useState();
  const [tooltipCoordinates, setTooltipCoordinates] = useState<
    Position | undefined
  >();
  const [tooltipName, setTooltipName] = useState("");
  const [tooltipOffset, setTooltipOffset] = useState<Offset>([0, 0]);
  const [baseStyle, setBaseStyle] = useState<StyleSpecification | null>(null);

  async function handleMove(e: MapLayerMouseEvent) {
    const map: MapRef | null = mapRef.current;
    if (map === null) {
      return;
    }

    const layerFeatures = map.queryRenderedFeatures(e.point, {
      layers: [UNCLUSTERED_LAYER_ID],
    });

    if (!layerFeatures || layerFeatures.length === 0 || !map || popupLocation) {
      setTooltipCoordinates(undefined);
      return;
    }

    const feature = layerFeatures[0];
    const { ix } = feature.properties;
    const datasetId = getDatasetId() as string;

    const response = await getDatasetItem({
      params: { datasetId, datasetItemIdOrIx: encodeBase64(`@${ix}`) },
      query: { returnProps: ["name"] },
    });

    if (response.status === 200 && response.body.name) {
      const name = response.body.name as string;

      const spiderfyOffset = [0, 0];

      // Shift the tooltip up a bit so it doesn't cover the marker
      const popupOffset: [number, number] = spiderfyOffset
        ? [spiderfyOffset[0], spiderfyOffset[1] - 30]
        : [0, -30];

      if (feature.geometry.type === "Point") {
        setTooltipCoordinates(feature.geometry.coordinates);
      }
      setTooltipName(name);
      setTooltipOffset(popupOffset);
    }
  }

  function handleClick(e: MapLayerMouseEvent) {
    const features = e.features;
    const map: MapRef | null = mapRef.current;
    if (map === null) {
      return;
    }

    if (!features || features.length === 0 || !map) return;

    const feature = features[0];

    if (feature.layer.id === CLUSTER_LAYER_ID) {
      if (feature.geometry.type !== "Point") return;
      const clusterId = feature.properties.cluster_id;
      const [lng, lat] = feature.geometry.coordinates;

      map.flyTo({
        center: [lng, lat],
        zoom: map.getZoom() + 1,
        essential: true,
      });
      return;
    }

    if (feature.layer.id === UNCLUSTERED_LAYER_ID) {
      if (feature.geometry.type !== "Point") return;
      const [clickedLng, clickedLat] = feature.geometry.coordinates;

      const allFeatures = map.querySourceFeatures("points", {
        sourceLayer: "",
        filter: ["!", ["has", "point_count"]],
      });

      const colocated = allFeatures.filter((f) => {
        if (f.geometry.type !== "Point") return false;
        const [lng, lat] = f.geometry.coordinates;
        return lng === clickedLng && lat === clickedLat;
      });

      console.log(
        `Clicked ix=${feature.properties.ix}, colocated count: ${colocated.length}`,
        colocated.map((f) => f.properties.ix),
        allFeatures.map((f) => f.properties.ix),
      );

      popupCreatedCallback(feature.properties.ix);
      const [lng, lat] = feature.geometry.coordinates;

      map.easeTo({
        center: [lng, getMapCentreLatOffsetted(lat, map.getZoom())],
        offset: mapCenterOffsetPixels,
      });
    }
  }

  async function loadMarkerIcons() {
    if (!!mapRef.current && !!markerIcons) {
      let index = 0;
      let markerList: (string | number)[] = [];

      for (let marker of markerIcons) {
        // markerIcons entries are either bundled names (e.g. "dotcoop",
        // "default") that resolve to the front-end's static assets, or full
        // URLs / `dataset:` references that are served from the dataset
        const imgSrc =
          /^(https?:)?\/\//.test(marker) || marker.startsWith("dataset:")
            ? resolveAssetUrl(marker)
            : `./assets/markers/${marker}.png`;
        if (!imgSrc) continue;
        const image = await mapRef.current.loadImage(imgSrc);
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
        "icon-size": 1,
      });
    }
  }

  useEffect(() => {
    if (features.length > 0 && mapRef.current) {
      const map = mapRef.current;

      const bounds = fitBoundsToFeatures(features, mapCenterOffsetPixels);
      if (!bounds) return;
      const {
        minLng,
        minLat,
        maxLng,
        maxLat,
        basePadding,
        leftPadding,
        maxZoom,
      } = bounds;
      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: {
            top: basePadding,
            bottom: basePadding,
            left: leftPadding,
            right: basePadding,
          },
          duration: 1000,
          maxZoom,
        },
      );
    }
  }, [features]);

  useEffect(() => {
    if (popupLocation && mapRef.current && popupOrigin === "directory") {
      const map = mapRef.current;
      if (!map) {
        return;
      }
      const [lng, lat] = popupLocation;

      const isNearby = isLocationNear(popupLocation, map);

      if (isNearby) {
        map.easeTo({
          center: [lng, getMapCentreLatOffsetted(lat, map.getZoom())],
          offset: mapCenterOffsetPixels,
        });
      } else {
        map.jumpTo({
          center: [lng, getMapCentreLatOffsetted(lat, 15)],
          zoom: 15,
        });
      }
    }
  }, [popupLocation]);

  useEffect(() => {
    fetch(STYLE_URL)
      .then((res) => res.json())
      .then(setBaseStyle);
  }, []);

  const patchedStyle = useMemo(() => {
    if (!baseStyle) return undefined;
    return JSON.parse(
      JSON.stringify(baseStyle, (_key, val) =>
        typeof val === "string"
          ? val.replace(/name:[a-z]+/g, `name:${language.toLowerCase()}`)
          : val,
      ),
    );
  }, [baseStyle, language]);

  return (
    <Map
      interactiveLayerIds={[CLUSTER_LAYER_ID, UNCLUSTERED_LAYER_ID]}
      onClick={handleClick}
      onMouseMove={handleMove}
      initialViewState={{
        bounds: mapBounds,
      }}
      onLoad={() => {
        loadMarkerIcons();
        mapLoadedCallback();
      }}
      ref={mapRef}
      minZoom={1.45}
      maxZoom={18}
      attributionControl={false}
      dragRotate={false}
      keyboard={false}
      touchZoomRotate={false}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100vh",
      }}
      mapStyle={patchedStyle ?? STYLE_URL}
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
        <Layer
          id={CLUSTER_LAYER_ID}
          type="circle"
          source="points"
          filter={["has", "point_count"]}
          paint={{
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
          }}
        />
        <Layer
          id="cluster-count"
          type="symbol"
          source="points"
          filter={["has", "point_count"]}
          layout={{
            "text-field": "{point_count_abbreviated}",
            "text-size": 12,
          }}
        />
        {markerLayout && (
          <Layer
            id={UNCLUSTERED_LAYER_ID}
            type="symbol"
            source="points"
            filter={["!", ["has", "point_count"]]}
            layout={markerLayout}
            icon-padding={10}
          />
        )}
      </Source>
      {popupLocation && (
        <PopupContainer
          key={popupIndex}
          longitude={popupLocation[0]}
          latitude={popupLocation[1]}
          anchor="bottom"
          closeButton={false}
          maxWidth="none"
          offset={20}
          onClose={popupClosedCallback}
          className={`popup-ix-${popupIndex}`}
        >
          <Popup />
        </PopupContainer>
      )}
      {tooltipCoordinates && (
        <PopupContainer
          longitude={tooltipCoordinates[0]}
          latitude={tooltipCoordinates[1]}
          closeButton={false}
          maxWidth={"none"}
          className={"marker-tooltip"}
          anchor={"bottom"}
          offset={tooltipOffset}
        >
          <div className="px-[0.75rem] py-2">{tooltipName}</div>
        </PopupContainer>
      )}
    </Map>
  );
}
