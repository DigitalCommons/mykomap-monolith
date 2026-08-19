import type { AppStore } from "../../app/store";
import { makeStore } from "../../app/store";
import { configLoaded } from "../../app/configSlice";
import {
  populateSearchResults,
  setSelectedTab,
  togglePanel,
  toggleResultsPanel,
  openPanel,
  closePanel,
  openResultsPanel,
  closeResultsPanel,
  selectSelectedTab,
  selectPanelOpen,
  selectResultsPanelOpen,
  selectResultsStatus,
  selectResultsPage,
  selectResults,
} from "./panelSlice";
import { updateVisibleIndexes } from "./searchPanel/searchSlice";
import mockConfig from "../../mockApiResponses/mockConfig";
import { Config } from "../../services/types";
import * as services from "../../services";
import * as windowUtils from "../../utils/window-utils";

interface LocalTestContext {
  store: AppStore;
}

describe<LocalTestContext>("populateSearchResults", (it) => {
  const submapConfig: Config = {
    ...mockConfig,
    submaps: {
      "test-submap": {
        lockedFilter: ["data_sources:DC"],
      },
    },
  };

  const mockResults = [
    { index: 1, name: "Coop One", data_sources: ["DC"] },
    { index: 2, name: "Coop Two", data_sources: ["DC"] },
  ];

  beforeEach<LocalTestContext>((context) => {
    context.store = makeStore();

    vi.spyOn(windowUtils, "getDatasetId").mockReturnValue("test-dataset");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch results without a filter when there is no submap", async ({
    store,
  }) => {
    store.dispatch(configLoaded(mockConfig));

    const searchSpy = vi.spyOn(services, "searchDataset").mockResolvedValue({
      status: 200,
      body: mockResults,
      headers: new Headers(),
    });

    await store.dispatch(populateSearchResults(0));

    expect(searchSpy).toHaveBeenCalledWith({
      params: { datasetId: "test-dataset" },
      query: {
        filter: [],
        returnProps: ["name", "data_sources"],
        page: 0,
        pageSize: 50,
      },
    });
    expect(selectResults(store.getState())).toEqual(mockResults);
  });

  it("should apply the submap's locked filter to an empty user search", async ({
    store,
  }) => {
    vi.spyOn(windowUtils, "getSubmapId").mockReturnValue("test-submap");
    store.dispatch(configLoaded(submapConfig));

    const searchSpy = vi.spyOn(services, "searchDataset").mockResolvedValue({
      status: 200,
      body: mockResults,
      headers: new Headers(),
    });

    await store.dispatch(populateSearchResults(0));

    expect(searchSpy).toHaveBeenCalledWith({
      params: { datasetId: "test-dataset" },
      query: {
        filter: ["data_sources:DC"],
        returnProps: ["name", "data_sources"],
        page: 0,
        pageSize: 50,
      },
    });
    expect(selectResults(store.getState())).toEqual(mockResults);
  });

  it("should merge the locked filter with the user's search query", async ({
    store,
  }) => {
    vi.spyOn(windowUtils, "getSubmapId").mockReturnValue("test-submap");
    store.dispatch(configLoaded(submapConfig));
    store.dispatch(
      updateVisibleIndexes({
        searchQuery: { filter: ["country_id:FR"], text: "pears" },
        visibleIndexes: [1, 2],
      }),
    );

    const searchSpy = vi.spyOn(services, "searchDataset").mockResolvedValue({
      status: 200,
      body: mockResults,
      headers: new Headers(),
    });

    await store.dispatch(populateSearchResults(1));

    expect(searchSpy).toHaveBeenCalledWith({
      params: { datasetId: "test-dataset" },
      query: {
        filter: ["data_sources:DC", "country_id:FR"],
        text: "pears",
        returnProps: ["name", "data_sources"],
        page: 1,
        pageSize: 50,
      },
    });
  });
});

describe<LocalTestContext>("panel reducer", (it) => {
  beforeEach<LocalTestContext>((context) => {
    const store = makeStore();
    context.store = store;
  });

  it("should handle setSelectedTab", ({ store }) => {
    expect(selectSelectedTab(store.getState())).toBe(0);

    store.dispatch(setSelectedTab(2));

    expect(selectSelectedTab(store.getState())).toBe(2);
  });

  it("should handle togglePanel", ({ store }) => {
    expect(selectPanelOpen(store.getState())).toBe(false);

    store.dispatch(togglePanel());

    expect(selectPanelOpen(store.getState())).toBe(true);

    store.dispatch(togglePanel());

    expect(selectPanelOpen(store.getState())).toBe(false);
  });

  it("should handle openPanel and closePanel", ({ store }) => {
    expect(selectPanelOpen(store.getState())).toBe(false);

    store.dispatch(openPanel());
    expect(selectPanelOpen(store.getState())).toBe(true);

    // Should stay open
    store.dispatch(openPanel());
    expect(selectPanelOpen(store.getState())).toBe(true);

    store.dispatch(closePanel());
    expect(selectPanelOpen(store.getState())).toBe(false);

    // Should stay closed
    store.dispatch(closePanel());
    expect(selectPanelOpen(store.getState())).toBe(false);
  });

  it("should handle toggleResultsPanel", ({ store }) => {
    expect(selectResultsPanelOpen(store.getState())).toBe(false);

    store.dispatch(toggleResultsPanel());

    expect(selectResultsPanelOpen(store.getState())).toBe(true);

    store.dispatch(toggleResultsPanel());

    expect(selectResultsPanelOpen(store.getState())).toBe(false);
  });

  it("should handle openResultsPanel and closeResultsPanel", ({ store }) => {
    expect(selectResultsPanelOpen(store.getState())).toBe(false);

    store.dispatch(openResultsPanel());
    expect(selectResultsPanelOpen(store.getState())).toBe(true);

    // Should stay open
    store.dispatch(openResultsPanel());
    expect(selectResultsPanelOpen(store.getState())).toBe(true);

    store.dispatch(closeResultsPanel());
    expect(selectResultsPanelOpen(store.getState())).toBe(false);

    // Should stay closed
    store.dispatch(closeResultsPanel());
    expect(selectResultsPanelOpen(store.getState())).toBe(false);
  });

  it("should handle populateSearchResults pending", ({ store }) => {
    expect(selectResultsStatus(store.getState())).toBe("idle");

    store.dispatch({
      type: "panel/populateSearchResults/pending",
      meta: { arg: 1, requestId: "test", requestStatus: "pending" },
    });

    expect(selectResultsStatus(store.getState())).toBe("loading");
  });

  it("should handle populateSearchResults fulfilled", ({ store }) => {
    const mockResults = [
      { index: 1, name: "Test Item 1" },
      { index: 2, name: "Test Item 2" },
      { index: 3, name: "Test Item 3" },
    ];

    expect(selectResultsStatus(store.getState())).toBe("idle");
    expect(selectResultsPage(store.getState())).toBe(0);
    expect(selectResults(store.getState())).toEqual([]);

    store.dispatch({
      type: "panel/populateSearchResults/fulfilled",
      payload: mockResults,
      meta: { arg: 2, requestId: "test", requestStatus: "fulfilled" },
    });

    expect(selectResultsStatus(store.getState())).toBe("idle");
    expect(selectResultsPage(store.getState())).toBe(2);
    expect(selectResults(store.getState())).toEqual(mockResults);
  });

  it("should handle populateSearchResults rejected", ({ store }) => {
    expect(selectResultsStatus(store.getState())).toBe("idle");

    store.dispatch({
      type: "panel/populateSearchResults/rejected",
      payload: "Failed to fetch results",
      meta: { arg: 1, requestId: "test", requestStatus: "rejected" },
    });

    expect(selectResultsStatus(store.getState())).toBe("failed");
    expect(selectResults(store.getState())).toEqual([]);
  });

  it("should select panel state correctly", ({ store }) => {
    const state = store.getState();

    expect(selectSelectedTab(state)).toBe(0);
    expect(selectPanelOpen(state)).toBe(false);
    expect(selectResultsPanelOpen(state)).toBe(false);
    expect(selectResultsStatus(state)).toBe("idle");
    expect(selectResultsPage(state)).toBe(0);
    expect(selectResults(state)).toEqual([]);
  });

  it("should handle multiple state changes", ({ store }) => {
    // Change multiple states
    store.dispatch(setSelectedTab(1));
    store.dispatch(openPanel());
    store.dispatch(openResultsPanel());

    const state = store.getState();

    expect(selectSelectedTab(state)).toBe(1);
    expect(selectPanelOpen(state)).toBe(true);
    expect(selectResultsPanelOpen(state)).toBe(true);
  });
});
