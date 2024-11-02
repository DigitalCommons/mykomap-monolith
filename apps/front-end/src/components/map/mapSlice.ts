import { createSelector } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice";
import { getDatasetLocations } from "../../services";

export interface MapSliceState {
  allLocations: number[][];
  status: string;
}

const initialState: MapSliceState = {
  allLocations: [[]],
  status: "loading",
};

export const mapSlice = createAppSlice({
  name: "map",
  initialState,
  reducers: (create) => ({
    fetchData: create.asyncThunk(
      async (_, thunkApi) => {
        const datasetId =
          new URLSearchParams(window.location.search).get("datasetId") ?? "";
        if (datasetId === "") {
          return thunkApi.rejectWithValue(
            `No datasetId parameter given, so no dataset can be fetched`,
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
          console.error(action.payload);
        },
      },
    ),
  }),
});

// We use the createSelector function from the Redux Toolkit for memoization, so that we don't need
// to reform the features array every time the selector is called.
// https://redux.js.org/usage/deriving-data-selectors#writing-memoized-selectors-with-reselect
const selectAllFeatures = createSelector(
  [(state): number[][] => state.map.allLocations],
  (allLocations): GeoJSON.Feature<GeoJSON.Point>[] =>
    allLocations.map((location, ix) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: location },
      properties: { ix },
    })),
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
    indexes === undefined ? allFeatures : indexes.map((ix) => allFeatures[ix]),
);

export const { fetchData } = mapSlice.actions;
