import { dataset } from "../services";

const generateGeoJSONFeatures = (
  pointCount: number,
): GeoJSON.Feature<GeoJSON.Point>[] => {
  const minLat = -90;
  const rangeLat = 180;
  const minLng = -180;
  const rangeLng = 360;

  // Sort IDs in initial data for easier filtering later
  const ids: string[] = Array.from({ length: pointCount }, (_v, _k) =>
    (Math.random() + 1).toString(36).substring(7),
  ).sort();

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
        name: `Marker ${k}`,
        id: ids[k],
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

  return features;
};

/** Lazy load the data once into this variable */
let features: GeoJSON.Feature<GeoJSON.Point>[] | undefined = undefined;

const urlParams = new URLSearchParams(window.location.search);
const datasetId = urlParams.get('datasetId') ?? '';
if (datasetId === '') {
  console.warn("No datasetId parameter given, so no dataset can be loaded");
  features = [];
}
else {
  console.info("Loading dataset ID "+datasetId);
}

const featuresPromise =
  features ??
  dataset({ path: { datasetId } })
    .then((response) => {
      const locations = response.data ?? [];
      features = locations.map((location, index) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: location },
        properties: { id: index }, // id is the index of original array
      }));
      // We want this data to be immutable
      return features;
    })
    .catch((error) => {
      console.error(`Error getting dataset with ID ${datasetId}`, error);
      features = [];
      return features;
    });

/**
 * The array that is returned contains references to the original data, so shouldn't use a lot of
 * extra memory.
 *
 * @param ids Array of N ids (indexes of the features array) to filter
 * @returns Array of N GeoJSON features with the given ids
 */
export const getFilteredFeatures = async (
  ids: number[],
): Promise<GeoJSON.Feature<GeoJSON.Point>[]> => {
  const features = await featuresPromise;
  const filtered = ids.map((id) => features[id]);
  return filtered;
};

export default featuresPromise;
