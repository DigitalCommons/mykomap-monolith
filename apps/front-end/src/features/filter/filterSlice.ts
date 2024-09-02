import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice";
import { datasetSearch } from "../../services";

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
        const { filter } = thunkApi.getState() as { filter: FilterSliceState };
        const response = await datasetSearch({
          path: { datasetId: "test-500000" },
          query: { text: filter.text.toLowerCase() },
        });
        // The value we return becomes the `fulfilled` action payload
        return response.data;
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "idle";
          state.visibleIds = action.payload ?? [];
        },
        rejected: (state) => {
          state.status = "failed";
          state.visibleIds = [];
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
