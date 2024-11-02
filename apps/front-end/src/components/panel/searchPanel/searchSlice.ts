import { createAction, type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../../app/createAppSlice";
import { Config, getConfig, searchDataset } from "../../../services";

export interface SearchSliceState {
  text: string;
  visibleIndexes: number[];
  searchingStatus: string;
  filterOptions: { [field: string]: string[] };
}

const initialState: SearchSliceState = {
  text: "",
  visibleIndexes: [],
  searchingStatus: "idle",
  filterOptions: {},
};

export const searchSlice = createAppSlice({
  name: "search",
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
            `No datasetId parameter given, so no dataset can be searched`,
          );
        }

        const { search } = thunkApi.getState() as { search: SearchSliceState };
        if (search.text === "") {
          return thunkApi.fulfillWithValue([]);
        }

        const response = await searchDataset({
          params: { datasetId },
          query: { text: search.text.toLowerCase() },
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
          state.searchingStatus = "loading";
        },
        fulfilled: (state, action) => {
          state.searchingStatus = "idle";
          state.visibleIndexes =
            action.payload.map((index) => Number(index.substring(1))) ?? []; // remove leading '@' from index
        },
        rejected: (state, action) => {
          state.searchingStatus = "failed";
          state.visibleIndexes = [];
          console.error(action.payload);
        },
      },
    ),
    fetchConfig: create.asyncThunk(
      async (_, thunkApi) => {
        const datasetId =
          new URLSearchParams(window.location.search).get("datasetId") ?? "";
        if (datasetId === "") {
          return thunkApi.rejectWithValue(
            `No datasetId parameter given, so no dataset config can be retrieved`,
          );
        }

        const response = await getConfig({
          params: { datasetId: datasetId },
        });
        if (response.status === 200) {
          thunkApi.dispatch(configLoaded(response.body));
          return response.body;
        } else {
          return thunkApi.rejectWithValue(
            `Failed get config, status code ${response.status}`,
          );
        }
      },
      {
        fulfilled: (state, action) => {
          // TODO when types work:
          // transform config.ui.filterableFields and config.vocabs terms into filterOptions dictionary
        },
        rejected: (state, action) => {
          console.error(action.payload);
        },
      },
    ),
  }),
  selectors: {
    selectText: (search) => search.text,
    selectVisibleIndexes: (search) => search.visibleIndexes,
  },
});

export const configLoaded = createAction<Config>("configLoaded");

export const { setText, performSearch } = searchSlice.actions;

export const { selectText, selectVisibleIndexes } = searchSlice.selectors;
