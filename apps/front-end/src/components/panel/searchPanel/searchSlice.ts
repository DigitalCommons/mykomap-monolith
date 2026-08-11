import { createSelector, type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../../app/createAppSlice";
import type { Config } from "../../../services/types";
import { searchDataset } from "../../../services";
import { configLoaded, resolveSubmap } from "../../../app/configSlice";
import { getDatasetId } from "../../../utils/window-utils";
import { populateSearchResults } from "../panelSlice";
import { AppThunk } from "../../../app/store";
import i18n from "../../../i18n";
import { VocabDef } from "@mykomap/common";

type FilterableVocabProp = {
  id: string;
  value: string;
  vocabUri: string;
  titleUri?: string;
  sorted?: boolean | string;
};

type SearchQuery = {
  filter?: string[];
  text?: string;
};

export interface SearchSliceState {
  text: string;
  visibleIndexes: number[]; // if empty, show all items
  searchingStatus: "idle" | "loading" | "failed";
  filterableVocabProps: FilterableVocabProp[];
  searchQuery: SearchQuery;
  // Filters from the active submap - sent with every serach
  // Excluded from filterableVocabProps so they never appear in filter UI
  //  and they stay after clearSearch and don't do in searchQuery
  //  so the sharable q URL param doesn't get them (submap URL param does)
  lockedFilter: string[];
}

const initialState: SearchSliceState = {
  text: "",
  visibleIndexes: [],
  searchingStatus: "idle",
  filterableVocabProps: [],
  searchQuery: {},
  lockedFilter: [],
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
      state.lockedFilter = resolveSubmap(config)?.lockedFilter ?? [];
      const lockedPropIds = new Set(
        state.lockedFilter.map((filter) => filter.split(":")[0]),
      );
      const filterableVocabProps: FilterableVocabProp[] = [];
      Object.entries(config.itemProps).forEach(([propId, propSpec]) => {
        if (lockedPropIds.has(propId)) return;
        if (propSpec.filter) {
          if (propSpec.type === "vocab") {
            filterableVocabProps.push({
              id: propId,
              value: PROP_VALUE_ANY,
              vocabUri: propSpec.uri.replace(/:$/, ""), // Strip the trailing colon from this (assumed) abbrev URI
              titleUri: propSpec.titleUri,
              sorted: propSpec.sorted,
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
              sorted: propSpec.of.sorted,
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
      return (
        activeFilters.length > 0 ||
        search.text.length > 0 ||
        search.lockedFilter.length > 0
      );
    },
    // Like selectIsFilterActive, but ignoring the submap's locked filter -
    // true only when the user themselves narrowed the results
    selectIsUserFilterActive: (search) => {
      const activeFilters = search.filterableVocabProps.filter(
        (prop) => prop.value !== PROP_VALUE_ANY,
      );
      return activeFilters.length > 0 || search.text.length > 0;
    },
    selectSearchQuery: (search) => search.searchQuery,
    selectLockedFilter: (search) => search.lockedFilter,
  },
});

const PROP_VALUE_ANY = "any";

export const {
  setText,
  setFilterValue,
  updateVisibleIndexes,
  setSearchingStatus,
  clearSearch,
} = searchSlice.actions;

export const {
  selectText,
  selectVisibleIndexes,
  selectIsFilterActive,
  selectIsUserFilterActive,
  selectSearchQuery,
  selectLockedFilter,
} = searchSlice.selectors;

type Term = VocabDef["terms"];

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

        // Define sorters for ascending, descending, and no sort
        const sorters = {
          asc: (a: Term, b: Term) => a.label.localeCompare(b.label),
          desc: (a: Term, b: Term) => b.label.localeCompare(a.label),
          noSort: (_a: Term, _b: Term) => 0,
        };

        const sorter =
          prop.sorted === false
            ? sorters.noSort
            : (prop.sorted && sorters[prop.sorted as keyof typeof sorters]) ||
              sorters.asc;

        return {
          id: prop.id,
          title: title,
          options: [
            { value: PROP_VALUE_ANY, label: `- ${i18n.t("any")} -` },
            ...Object.entries(vocabs[prop.vocabUri][language].terms)
              .map(([key, value]) => ({ value: key, label: value }))
              .sort(sorter), // sort options using the selected sorter
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
    const hasUserQuery = activeFilters.length > 0 || search.text !== "";
    if (!hasUserQuery && search.lockedFilter.length === 0) {
      // empty search query so show all items
      dispatch(updateVisibleIndexes({ searchQuery: {}, visibleIndexes: [] }));
      dispatch(populateSearchResults(0));
      return;
    }

    // The user's own query - shared in the URL (excludes submap locked params)
    const searchQuery = hasUserQuery
      ? {
          filter: activeFilters.map((prop) => `${prop.id}:${prop.value}`),
          text: search.text.trim().toLowerCase() || undefined,
        }
      : {};

    dispatch(setSearchingStatus("loading"));

    const response = await searchDataset({
      params: { datasetId },
      query: {
        ...searchQuery,
        filter: [...search.lockedFilter, ...(searchQuery.filter ?? [])],
      },
    });
    if (response.status === 200) {
      dispatch(
        updateVisibleIndexes({
          searchQuery,
          visibleIndexes: response.body as number[],
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

// Clear user serach - re runs the locked submap search if one is active
export const clearSearchAndRefresh = (): AppThunk => {
  return async (dispatch, getState) => {
    dispatch(clearSearch());
    if (getState().search.lockedFilter.length > 0) {
      await dispatch(performSearch());
    }
  };
};

// Runs the inital search for a locked submap filter - map shows locked subset
export const performInitialLockedSearch = (): AppThunk => {
  return async (dispatch, getState) => {
    if (getState().search.lockedFilter.length === 0) return;
    if (new URLSearchParams(window.location.search).get("q")) return;
    await dispatch(performSearch());
  };
};

export const performSearchFromQuery = (searchQuery: SearchQuery): AppThunk => {
  return async (dispatch, getState) => {
    const { search } = getState();

    // Set filter values and text to match the given search query
    search.filterableVocabProps.forEach((prop) => {
      const filterStr = searchQuery.filter?.find((f) =>
        f.startsWith(`${prop.id}:`),
      );
      if (filterStr) {
        const [, value] = filterStr.split(":");
        dispatch(setFilterValue({ id: prop.id, value }));
      } else {
        dispatch(setFilterValue({ id: prop.id, value: PROP_VALUE_ANY }));
      }
    });
    dispatch(setText(searchQuery.text ?? ""));

    // Now perform the search
    await dispatch(performSearch());
  };
};
