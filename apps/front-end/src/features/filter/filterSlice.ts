import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice";
import { searchDataset } from "../../services";

export interface FilterSliceState {
  text: string;
  visibleIds: number[];
  status: string;
}

const initialState: FilterSliceState = {
  text: "",
  visibleIds: [],
  status: "idle",
};

export const filterSlice = createAppSlice({
  name: "filter",
  initialState,
  reducers: (create) => ({
    setText: create.reducer((state, action: PayloadAction<string>) => {
      state.text = action.payload;
    }),
    performSearch: create.asyncThunk(
      async (_, thunkApi) => {
        const datasetId =
          new URLSearchParams(window.location.search).get("datasetId") ?? "";
        if (datasetId === "") {
          return thunkApi.rejectWithValue(
            `No datasetId parameter given, so no dataset can be filtered`,
          );
        }

        const { filter } = thunkApi.getState() as { filter: FilterSliceState };
        const response = await searchDataset({
          params: { datasetId: datasetId },
          query: { text: filter.text.toLowerCase() },
        });
        if (response.status === 200) {
          return response.body;
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
          state.status = "idle";
          state.visibleIds = action.payload ?? [];
        },
        rejected: (state, action) => {
          state.status = "failed";
          state.visibleIds = [];
          console.error(action.payload);
        },
      },
    ),
  }),
  selectors: {
    selectText: (filter) => filter.text,
    selectVisibleIds: (filter) => filter.visibleIds,
  },
});

export const { setText, performSearch } = filterSlice.actions;

export const { selectText, selectVisibleIds } = filterSlice.selectors;
