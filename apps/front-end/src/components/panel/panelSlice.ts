import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice";
import { getUrlSearchParam } from "../../utils/window-utils";
import { searchDataset } from "../../services";
import { SearchSliceState } from "./searchPanel/searchSlice";

const RESULTS_PER_PAGE = 10;

interface PanelSliceState {
  selectedTab: number;
  panelVisible: boolean;
  isOpen: boolean;
  resultsOpen: boolean;
  resultsStatus: "idle" | "loading" | "failed";
  resultsPage: number;
  // TODO: maybe cache all results that we have fetched, since user may flick back and forth
  results: { index: number; name: string }[];
}

const initialState: PanelSliceState = {
  selectedTab: 0,
  panelVisible: false,
  isOpen: false,
  resultsOpen: false,
  resultsStatus: "idle",
  resultsPage: 0,
  results: [],
};

export const panelSlice = createAppSlice({
  name: "panel",
  initialState,
  reducers: (create) => ({
    setSelectedTab: create.reducer((state, action: PayloadAction<number>) => {
      state.selectedTab = action.payload;
    }),
    setPanelVisible: create.reducer((state, action: PayloadAction<boolean>) => {
      state.panelVisible = action.payload;
    }),
    togglePanel: create.reducer((state) => {
      state.isOpen = !state.isOpen;
    }),
    toggleResultsPanel: create.reducer((state) => {
      state.resultsOpen = !state.resultsOpen;
    }),
    closePanel: create.reducer((state) => {
      state.isOpen = false;
      state.panelVisible = false;
    }),
    openResultsPanel: create.reducer((state) => {
      state.resultsOpen = true;
    }),
    closeResultsPanel: create.reducer((state) => {
      state.resultsOpen = false;
    }),
    populateSearchResults: create.asyncThunk(
      async (page: number, thunkApi) => {
        const datasetId = getUrlSearchParam("datasetId");
        if (datasetId === null) {
          return thunkApi.rejectWithValue(
            `No datasetId parameter given, so no dataset can be searched`,
          );
        }

        const { search } = thunkApi.getState() as {
          search: SearchSliceState;
        };

        const response = await searchDataset({
          params: { datasetId },
          query: {
            ...search.searchQuery,
            returnProps: ["name"],
            // page, TODO: implement pagination. For now, just fetch all results
            // pageSize: RESULTS_PER_PAGE,
          },
        });
        if (response.status === 200) {
          thunkApi.dispatch(openResultsPanel());
          const body = response.body as { index: string; name: string }[];
          return body.map(({ index, name }) => ({
            index: Number(index.substring(1)), // remove leading '@' from index
            name,
          }));
        } else {
          return thunkApi.rejectWithValue(
            `Failed search, status code ${response.status}`,
          );
        }
      },
      {
        pending: (state) => {
          state.resultsStatus = "loading";
        },
        fulfilled: (state, action) => {
          state.resultsStatus = "idle";
          state.resultsPage = action.meta.arg;
          state.results = action.payload;
        },
        rejected: (state, action) => {
          state.resultsStatus = "failed";
          state.results = [];
          console.error("Error fetching search results", action.payload);
        },
      },
    ),
  }),
  selectors: {
    selectSelectedTab: (panel) => panel.selectedTab,
    selectPanelVisible: (panel) => panel.panelVisible,
    selectPanelOpen: (panel) => panel.isOpen,
    selectResultsPanelOpen: (panel) => panel.resultsOpen,
    selectResultsStatus: (panel) => panel.resultsStatus,
    selectResultsPage: (panel) => panel.resultsPage,
    selectResults: (panel) => panel.results,
  },
});

export const {
  setSelectedTab,
  setPanelVisible,
  togglePanel,
  toggleResultsPanel,
  closePanel,
  openResultsPanel,
  closeResultsPanel,
  populateSearchResults,
} = panelSlice.actions;

export const {
  selectSelectedTab,
  selectPanelVisible,
  selectPanelOpen,
  selectResultsPanelOpen,
  selectResultsStatus,
  selectResultsPage,
  selectResults,
} = panelSlice.selectors;
