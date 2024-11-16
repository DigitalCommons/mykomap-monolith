import { createSelector } from "@reduxjs/toolkit";
import { z } from "zod";

import { notNullish, schemas } from "@mykomap/common";
import { createAppSlice } from "../../app/createAppSlice";
import { getDatasetLocations } from "../../services";
import { getUrlSearchParam } from "../../utils/window-utils";

export type Location = z.infer<typeof schemas.Location>;
export type DatasetLocations = z.infer<typeof schemas.DatasetLocations>;

export interface MapSliceState {
  allLocations: DatasetLocations;
  status: string;
}

const initialState: MapSliceState = {
  allLocations: [],
  status: "loading",
};

export const mapSlice = createAppSlice({
  name: "map",
  initialState,
  reducers: (create) => ({
    fetchLocations: create.asyncThunk(
      async (_, thunkApi) => {
        const datasetId = getUrlSearchParam("datasetId");
        if (datasetId === null) {
          return thunkApi.rejectWithValue(
            `No datasetId parameter given, so dataset locations cannot be fetched`,
          );
        }

        const response = await getDatasetLocations({ params: { datasetId } });

        if (response.status === 200) {
          const locations = response.body ?? [];
          return locations;
        } else {
          return thunkApi.rejectWithValue(
            `Failed search, status code ${response.status}`,
          );
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "loaded";
          state.allLocations = action.payload;
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.allLocations = [];
          console.error("Error fetching locations", action.payload);
        },
      },
    ),
  }),
});

// We use the createSelector function from the Redux Toolkit for memoization, so that we don't need
// to re-form the features array every time the selector is called.
// https://redux.js.org/usage/deriving-data-selectors#writing-memoized-selectors-with-reselect
const selectAllFeatures = createSelector(
  [(state): DatasetLocations => state.map.allLocations],
  (allLocations): (GeoJSON.Feature<GeoJSON.Point> | null)[] =>
    allLocations.map((location, ix) => {
      if (!location) return null; // skip non-locations here to preserve index counting
      const point: GeoJSON.Feature<GeoJSON.Point> = {
        type: "Feature",
        geometry: { type: "Point", coordinates: location },
        properties: { ix },
      };
      return point;
    }),
);

/**
 * This selector outputs a list of GeoJSON features for all the locations in the dataset, or for a
 * subset of locations if an array of indexes is provided.
 */
export const selectFeatures = createSelector(
  [
    selectAllFeatures,
    (state, indexes?: number[]): number[] | undefined => indexes,
  ],
  (allFeatures, indexes): GeoJSON.Feature<GeoJSON.Point>[] =>
    indexes === undefined
      ? allFeatures.filter(notNullish)
      : indexes.map((ix) => allFeatures[ix]).filter(notNullish),
);

export const { fetchLocations } = mapSlice.actions;
