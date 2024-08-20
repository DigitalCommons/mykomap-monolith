import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice";
import allFeatures from "../../data/geojson";

export interface FilterSliceState {
  search: string;
  visibleIds: string[];
}

const initialState: FilterSliceState = {
  search: "",
  visibleIds: [],
};

export const filterSlice = createAppSlice({
  name: "filter",
  initialState,
  reducers: (create) => ({
    searchForString: create.reducer((state, action: PayloadAction<string>) => {
      const searchString = action.payload.toLowerCase();
      state.search = searchString;
      state.visibleIds = allFeatures
        .filter((feature) =>
          feature?.properties?.Name.toLowerCase().includes(searchString),
        )
        .map((feature) => feature!!.properties!!.Identifier);
    }),
  }),
  selectors: {
    selectSearch: (filter) => filter.search,
    selectVisibleIds: (filter) => filter.visibleIds,
  },
});

export const { searchForString } = filterSlice.actions;

export const { selectSearch, selectVisibleIds } = filterSlice.selectors;
