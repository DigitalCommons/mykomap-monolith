import { useEffect, useState, useRef } from "react";
import Map, {
  NavigationControl,
  AttributionControl,
  Source,
  Layer,
  MapLayerMouseEvent,
  MapRef,
  Popup as PopupContainer,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useDispatch } from "react-redux";
import Popup from "../popup/Popup";
import { fitBoundsToFeatures, isLocationNear } from "../../utils/map-utils";

const getMapCentreLatOffsetted = (lat: number, zoom: number) =>
  Math.min(90, lat + 87 * Math.exp(-0.704 * zoom));

const mapTilerKey = import.meta.env.VITE_MAPTILER_API_KEY;
const CLUSTER_LAYER_ID = "clusters";
const UNCLUSTERED_LAYER_ID = "unclustered-point";

const clusterLayer = {
  id: CLUSTER_LAYER_ID,
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

export default function MapLibre({
  mapBounds,
  features,
  markerIcons,
  popupCreatedCallback,
  popupClosedCallback,
  popupIndex,
  popupLocation,
  popupOrigin,
  mapCenterOffsetPixels,
}) {
  const dispatch = useDispatch();
  const mapRef = useRef<MapRef>(null);
  const [markerLayout, setMarkerLayout] = useState();

  function handleClick(e: MapLayerMouseEvent) {
    const features = e.features;
    const map: MapRef = mapRef.current;

    if (!features || features.length === 0 || !map) return;

    const feature = features[0];

    if (feature.layer.id === CLUSTER_LAYER_ID) {
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
      popupCreatedCallback(feature.properties.ix);
      const [lng, lat] = feature.geometry.coordinates;

      map.easeTo({
        center: [lng, getMapCentreLatOffsetted(lat, map.getZoom())],
        offset: mapCenterOffsetPixels,
      });
    }
  }

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
        "icon-size": 1,
      });
    }
  }

  useEffect(() => {
    loadMarkerIcons();
  }, [markerIcons, mapRef.current]);

  useEffect(() => {
    if (features.length > 0 && mapRef.current) {
      const map = mapRef.current;

      const {
        minLng,
        minLat,
        maxLng,
        maxLat,
        basePadding,
        leftPadding,
        maxZoom,
      } = fitBoundsToFeatures(features, mapCenterOffsetPixels);
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

  return (
    <Map
      interactiveLayerIds={[CLUSTER_LAYER_ID, UNCLUSTERED_LAYER_ID]}
      onClick={handleClick}
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
        {markerLayout && (
          <Layer
            id={UNCLUSTERED_LAYER_ID}
            type={"symbol"}
            source={"points"}
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
    </Map>
  );
}
