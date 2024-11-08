import { createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../../app/createAppSlice";
import type { Config, VocabPropDef } from "../../../services";
import { searchDataset } from "../../../services";
import { configLoaded } from "../../../app/vocabsSlice";

type FilterableField = {
  id: string;
  value: string;
  vocabUri: string;
  titleUri?: string;
};

export interface SearchSliceState {
  text: string;
  visibleIndexes: number[];
  searchingStatus: string;
  filterableFields: FilterableField[];
}

const initialState: SearchSliceState = {
  text: "",
  visibleIndexes: [],
  searchingStatus: "idle",
  filterableFields: [],
};

export const searchSlice = createAppSlice({
  name: "search",
  initialState,
  reducers: (create) => ({
    setText: create.reducer((state, action: PayloadAction<string>) => {
      state.text = action.payload;
    }),
    setFilterValue: create.reducer(
      (state, action: PayloadAction<{ id: string; value: string }>) => {
        const field = state.filterableFields.find(
          (f) => f.id === action.payload.id,
        );
        if (field) field.value = action.payload.value;
      },
    ),
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
          console.error("Error performing search", action.payload);
        },
      },
    ),
  }),
  extraReducers: (builder) => {
    builder.addCase(configLoaded, (state, action) => {
      const config = action.payload;
      state.filterableFields = config.ui.filterableFields.map((name) => {
        const propDef = config.itemProps[name] as VocabPropDef;
        return {
          id: name,
          value: PROP_VALUE_ANY,
          vocabUri: propDef.uri,
          titleUri: propDef.titleUri,
        };
      });
    });
  },
  selectors: {
    selectText: (search) => search.text,
    selectVisibleIndexes: (search) => search.visibleIndexes,
  },
});

// TODO: add this to ui vocabs so it is translatable
const PROP_VALUE_ANY = "any";

export const { setText, setFilterValue, performSearch } = searchSlice.actions;

export const { selectText, selectVisibleIndexes } = searchSlice.selectors;

export const selectFilterOptions = createSelector(
  [
    (state): FilterableField[] => state.search.filterableFields,
    (state): Config["vocabs"] => state.vocabs.vocabs,
    (state): string => state.vocabs.language,
  ],
  (
    filterableFields,
    vocabs,
    language,
  ): {
    id: string;
    title: string;
    options: { value: string; label: string }[];
    value: string;
  }[] =>
    filterableFields.map((field) => ({
      id: field.id,
      // TODO: translate field ID to text using titleUri
      title: field.id,
      options: [
        { value: PROP_VALUE_ANY, label: "- Any -" },
        ...Object.entries(vocabs[field.vocabUri][language].terms).map(
          ([key, value]) => ({ value: key, label: value }),
        ),
      ],
      value: field.value,
    })),
);
