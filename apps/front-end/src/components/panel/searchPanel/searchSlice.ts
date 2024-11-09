import { createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../../app/createAppSlice";
import type { Config } from "../../../services";
import { searchDataset } from "../../../services";
import { configLoaded } from "../../../app/configSlice";

type FilterableVocabProp = {
  id: string;
  value: string;
  vocabUri: string;
  titleUri?: string;
};

export interface SearchSliceState {
  text: string;
  visibleIndexes: number[];
  searchingStatus: string;
  filterableVocabProps: FilterableVocabProp[];
}

const initialState: SearchSliceState = {
  text: "",
  visibleIndexes: [],
  searchingStatus: "idle",
  filterableVocabProps: [],
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
        const field = state.filterableVocabProps.find(
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
      const filterableVocabProps: FilterableVocabProp[] = [];
      Object.entries(config.itemProps).forEach(([name, propSpec]) => {
        if (propSpec.filter) {
          if (propSpec.type === "vocab") {
            filterableVocabProps.push({
              id: name,
              value: PROP_VALUE_ANY,
              vocabUri: propSpec.uri.replace(/:$/, ""), // Strip the trailing colon from this (assumed) abbrev URI
              titleUri: propSpec.titleUri,
            });
          } else if (
            propSpec.type === "multi" &&
            propSpec.of.type === "vocab"
          ) {
            filterableVocabProps.push({
              id: name,
              value: PROP_VALUE_ANY,
              vocabUri: propSpec.of.uri.replace(/:$/, ""),
              titleUri: propSpec.titleUri,
            });
          }
        }
      });
      state.filterableVocabProps = filterableVocabProps;
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
    (state): FilterableVocabProp[] => state.search.filterableVocabProps,
    (state): Config["vocabs"] => state.config.vocabs,
    (state): string => state.config.currentLanguage,
  ],
  (
    filterableVocabProps,
    vocabs,
    language,
  ): {
    id: string;
    title: string;
    options: { value: string; label: string }[];
    value: string;
  }[] =>
    filterableVocabProps.map((prop) => {
      console.log("aaaaaaa", vocabs[prop.vocabUri]);

      const title = prop.titleUri
        ? vocabs[prop.titleUri.split(":")[0]][language].terms[
            prop.titleUri.split(":")[1]
          ]
        : vocabs[prop.vocabUri][language].title;

      return {
        id: prop.id,
        title: title,
        options: [
          { value: PROP_VALUE_ANY, label: "- Any -" },
          ...Object.entries(vocabs[prop.vocabUri][language].terms).map(
            ([key, value]) => ({ value: key, label: value }),
          ),
        ],
        value: prop.value,
      };
    }),
);
