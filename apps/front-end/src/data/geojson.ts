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
        Name: `Marker ${k}`,
        Identifier: ids[k],
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

const data = generateGeoJSONFeatures(500000);

/**
 * Since we know feature IDs are sorted, we can filter the array in O(n) rather than O(n^2). The
 * array that is returned contains references to the original data, so shouldn't use a lot of extra
 * memory.
 *
 * @param ids Sorted array of feature IDs
 * @returns Array of GeoJSON features with matching IDs
 */
export const getFilteredFeatures = (
  ids: string[],
): GeoJSON.Feature<GeoJSON.Point>[] => {
  const filtered = [];
  let searchIndex = 0;

  for (const id of ids) {
    while (searchIndex < data.length) {
      if (data[searchIndex]?.properties?.Identifier === id) {
        filtered.push(data[searchIndex]);
        searchIndex++;
        break;
      }
      searchIndex++;
    }
  }
  return filtered;
};

export default data;
