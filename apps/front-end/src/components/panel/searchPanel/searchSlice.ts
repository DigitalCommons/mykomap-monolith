import { createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../../app/createAppSlice";
import type { Config } from "../../../services";
import { searchDataset } from "../../../services";
import { configLoaded } from "../../../app/configSlice";
import { getDatasetId } from "../../../utils/window-utils";
import { populateSearchResults } from "../panelSlice";
import { AppThunk } from "../../../app/store";
import i18n from "../../../i18n";

type FilterableVocabProp = {
  id: string;
  value: string;
  vocabUri: string;
  titleUri?: string;
};

type SearchQuery = {
  filter?: string | string[];
  text?: string;
};

export interface SearchSliceState {
  text: string;
  visibleIndexes: number[];
  searchingStatus: "idle" | "loading" | "failed";
  filterableVocabProps: FilterableVocabProp[];
  searchQuery: SearchQuery;
}

const initialState: SearchSliceState = {
  text: "",
  visibleIndexes: [],
  searchingStatus: "idle",
  filterableVocabProps: [],
  searchQuery: {},
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
    updateVisibleIndexes: create.reducer(
      (
        state,
        action: PayloadAction<{
          searchQuery: SearchQuery;
          visibleIndexes: number[];
        }>,
      ) => {
        state.searchQuery = action.payload.searchQuery;
        state.visibleIndexes = action.payload.visibleIndexes;
      },
    ),
    setSearchingStatus: create.reducer(
      (state, action: PayloadAction<"idle" | "loading" | "failed">) => {
        state.searchingStatus = action.payload;
      },
    ),
    clearSearch: create.reducer((state) => {
      state.text = "";
      state.filterableVocabProps.forEach(
        (prop) => (prop.value = PROP_VALUE_ANY),
      );
      state.visibleIndexes = [];
      state.searchQuery = {};
      state.searchingStatus = "idle";
    }),
  }),
  extraReducers: (builder) => {
    builder.addCase(configLoaded, (state, action) => {
      const config = action.payload;
      const filterableVocabProps: FilterableVocabProp[] = [];
      Object.entries(config.itemProps).forEach(([propId, propSpec]) => {
        if (propSpec.filter) {
          if (propSpec.type === "vocab") {
            filterableVocabProps.push({
              id: propId,
              value: PROP_VALUE_ANY,
              vocabUri: propSpec.uri.replace(/:$/, ""), // Strip the trailing colon from this (assumed) abbrev URI
              titleUri: propSpec.titleUri,
            });
          } else if (
            propSpec.type === "multi" &&
            propSpec.of.type === "vocab"
          ) {
            filterableVocabProps.push({
              id: propId,
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
    selectIsFilterActive: (search) => {
      const activeFilters = search.filterableVocabProps.filter(
        (prop) => prop.value !== PROP_VALUE_ANY,
      );
      return activeFilters.length > 0 || search.text.length > 0;
    },
  },
});

// TODO: add this to ui vocabs so it is translatable
const PROP_VALUE_ANY = "any";

export const {
  setText,
  setFilterValue,
  updateVisibleIndexes,
  setSearchingStatus,
  clearSearch,
} = searchSlice.actions;

export const { selectText, selectVisibleIndexes, selectIsFilterActive } =
  searchSlice.selectors;

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
    filterableVocabProps
      .filter((prop) => vocabs[prop.vocabUri])
      .map((prop) => {
        const title = prop.titleUri
          ? vocabs[prop.titleUri.split(":")[0]][language].terms[
              prop.titleUri.split(":")[1]
            ]
          : vocabs[prop.vocabUri][language].title;

        return {
          id: prop.id,
          title: title,
          options: [
            { value: PROP_VALUE_ANY, label: `- ${i18n.t("any")} -` },
            ...Object.entries(vocabs[prop.vocabUri][language].terms)
              .map(([key, value]) => ({ value: key, label: value }))
              .sort((a, b) => a.label.localeCompare(b.label)), // sort options alphabetically
          ],
          value: prop.value,
        };
      }),
);

export const performSearch = (): AppThunk => {
  return async (dispatch, getState) => {
    const datasetId = getDatasetId();
    if (datasetId === null) {
      console.error(
        `No datasetId parameter given, so no dataset can be searched`,
      );
      return;
    }

    const { search } = getState();

    const activeFilters = search.filterableVocabProps.filter(
      (prop) => prop.value !== PROP_VALUE_ANY,
    );
    if (activeFilters.length === 0 && search.text === "") {
      dispatch(updateVisibleIndexes({ searchQuery: {}, visibleIndexes: [] }));
      dispatch(populateSearchResults(0));
      return;
    }

    const searchQuery = {
      filter: activeFilters.map((prop) => `${prop.id}:${prop.value}`),
      text: search.text.trim().toLowerCase() || undefined,
    };

    dispatch(setSearchingStatus("loading"));

    const response = await searchDataset({
      params: { datasetId },
      query: searchQuery,
    });
    if (response.status === 200) {
      dispatch(
        updateVisibleIndexes({
          searchQuery,
          visibleIndexes: (response.body as string[]).map(
            (index) => Number(index.substring(1)), // remove leading '@' from index
          ),
        }),
      );
      dispatch(populateSearchResults(0));
      dispatch(setSearchingStatus("idle"));
    } else {
      console.error(`Failed search, status code ${response.status}`);
      dispatch(updateVisibleIndexes({ searchQuery: {}, visibleIndexes: [] }));
      dispatch(setSearchingStatus("failed"));
    }
  };
};
