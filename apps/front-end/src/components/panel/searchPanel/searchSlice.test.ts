import type { AppStore } from "../../../app/store";
import { makeStore } from "../../../app/store";
import { configLoaded, setLanguage } from "../../../app/configSlice";
import {
  selectFilterOptions,
  setFilterValue,
  setText,
  clearSearch,
  updateVisibleIndexes,
  selectText,
  selectVisibleIndexes,
  selectIsFilterActive,
  performSearch,
  performSearchFromQuery,
} from "./searchSlice";
import mockConfig from "../../../mockApiResponses/mockConfig";
import * as services from "../../../services";
import * as windowUtils from "../../../utils/window-utils";
import * as panelSlice from "../panelSlice";

interface LocalTestContext {
  store: AppStore;
}

describe<LocalTestContext>("search reducer", (it) => {
  beforeEach<LocalTestContext>((context) => {
    const store = makeStore();
    context.store = store;
  });

  it("should populate filterableVocabProps on config load", ({ store }) => {
    store.dispatch(configLoaded(mockConfig));

    const state = store.getState();
    expect(state.search.filterableVocabProps).toEqual([
      {
        id: "country_id",
        titleUri: undefined,
        value: "any",
        vocabUri: "coun",
        sorted: undefined,
      },
      {
        id: "primary_activity",
        titleUri: "ui:primary_activity",
        value: "any",
        vocabUri: "aci",
        sorted: undefined,
      },
      {
        id: "typology",
        titleUri: "ui:typology",
        value: "any",
        vocabUri: "bmt",
        sorted: undefined,
      },
      {
        id: "data_sources",
        titleUri: undefined,
        value: "any",
        vocabUri: "dso",
        sorted: false,
      },
    ]);
  });

  it("should handle setText", ({ store }) => {
    expect(selectText(store.getState())).toBe("");

    store.dispatch(setText("test search"));

    expect(selectText(store.getState())).toBe("test search");
  });

  it("should handle setFilterValue", ({ store }) => {
    store.dispatch(configLoaded(mockConfig));

    expect(store.getState().search.filterableVocabProps[0].value).toBe("any");

    store.dispatch(setFilterValue({ id: "country_id", value: "FR" }));

    expect(store.getState().search.filterableVocabProps[0].value).toBe("FR");
  });

  it("should handle updateVisibleIndexes", ({ store }) => {
    expect(selectVisibleIndexes(store.getState())).toEqual([]);

    store.dispatch(
      updateVisibleIndexes({
        searchQuery: { text: "test" },
        visibleIndexes: [1, 2, 3],
      }),
    );

    expect(selectVisibleIndexes(store.getState())).toEqual([1, 2, 3]);
    expect(store.getState().search.searchQuery).toEqual({ text: "test" });
  });

  it("should handle clearSearch", ({ store }) => {
    store.dispatch(configLoaded(mockConfig));
    store.dispatch(setText("test"));
    store.dispatch(setFilterValue({ id: "country_id", value: "FR" }));
    store.dispatch(
      updateVisibleIndexes({
        searchQuery: { text: "test" },
        visibleIndexes: [1, 2, 3],
      }),
    );

    expect(selectText(store.getState())).toBe("test");
    expect(selectVisibleIndexes(store.getState())).toEqual([1, 2, 3]);

    store.dispatch(clearSearch());

    expect(selectText(store.getState())).toBe("");
    expect(selectVisibleIndexes(store.getState())).toEqual([]);
    expect(store.getState().search.filterableVocabProps[0].value).toBe("any");
  });

  it("should selectIsFilterActive correctly", ({ store }) => {
    expect(selectIsFilterActive(store.getState())).toBe(false);

    store.dispatch(setText("test"));
    expect(selectIsFilterActive(store.getState())).toBe(true);

    store.dispatch(setText(""));
    store.dispatch(configLoaded(mockConfig));
    store.dispatch(setFilterValue({ id: "country_id", value: "FR" }));
    expect(selectIsFilterActive(store.getState())).toBe(true);
  });
});

describe<LocalTestContext>("selectFilterOptions", (it) => {
  beforeEach<LocalTestContext>((context) => {
    const store = makeStore();
    context.store = store;
    store.dispatch(configLoaded(mockConfig));
  });

  it("should return filter options in English with correct sorting", ({
    store,
  }) => {
    store.dispatch(setLanguage("en"));

    expect(selectFilterOptions(store.getState())).toEqual([
      {
        id: "country_id",
        title: "Country",
        options: [
          { value: "any", label: "- any -" }, // mocked i18n returns 'any' for this translation
          { value: "FR", label: "France" },
          { value: "GB", label: "United Kingdom" },
        ],
        value: "any",
      },
      {
        id: "primary_activity",
        title: "Primary Activity",
        options: [
          { value: "any", label: "- any -" }, // mocked i18n returns 'any' for this translation
          { value: "ICA210", label: "Housing" },
          { value: "ICA220", label: "Transport" },
          { value: "ICA230", label: "Utilities" },
        ],
        value: "any",
      },
      {
        id: "typology",
        title: "Typology",
        options: [
          { value: "any", label: "- any -" },
          { value: "BMT10", label: "Consumer/Users" },
          { value: "BMT20", label: "Producers" },
          { value: "BMT30", label: "Workers" },
        ],
        value: "any",
      },
      {
        id: "data_sources",
        options: [
          { label: "- any -", value: "any" },
          {
            label: "Co-operatives UK",
            value: "CUK",
          },
          {
            label: "DotCoop",
            value: "DC",
          },
          {
            label: "International Cooperative Alliance",
            value: "ICA",
          },
          {
            label: "National Cooperative Business Association (USA)",
            value: "NCBA",
          },
        ],
        title: "Data Source",
        value: "any",
      },
    ]);
  });

  it("should return filter options in French with correct sorting", ({
    store,
  }) => {
    store.dispatch(setLanguage("fr"));

    expect(selectFilterOptions(store.getState())).toEqual([
      {
        id: "country_id",
        title: "Pays",
        options: [
          { value: "any", label: "- any -" },
          { value: "FR", label: "France" },
          { value: "GB", label: "Royaume-Uni" },
        ],
        value: "any",
      },
      {
        id: "primary_activity",
        title: "Activité principale",
        options: [
          { value: "any", label: "- any -" },
          { value: "ICA210", label: "Logement" },
          { value: "ICA230", label: "Services publics" },
          { value: "ICA220", label: "Transports" },
        ],
        value: "any",
      },
      {
        id: "typology",
        title: "Typologie",
        options: [
          { value: "any", label: "- any -" },
          { value: "BMT10", label: "Consommateurs/usagers" },
          { value: "BMT20", label: "Producteurs" },
          { value: "BMT30", label: "Travailleurs" },
        ],
        value: "any",
      },
      {
        id: "data_sources",
        options: [
          { label: "- any -", value: "any" },
          {
            label: "Co-operatives UK",
            value: "CUK",
          },
          {
            label: "DotCoop",
            value: "DC",
          },
          {
            label: "Alliance coopérative internationale",
            value: "ICA",
          },
          {
            label: "National Cooperative Business Association (USA)",
            value: "NCBA",
          },
        ],
        title: "Source de données",
        value: "any",
      },
    ]);
  });
});

describe<LocalTestContext>("performSearch", (it) => {
  beforeEach<LocalTestContext>((context) => {
    const store = makeStore();
    context.store = store;
    store.dispatch(configLoaded(mockConfig));

    // Mock getDatasetId to return a test dataset
    vi.spyOn(windowUtils, "getDatasetId").mockReturnValue("test-dataset");

    // Mock populateSearchResults action
    vi.spyOn(panelSlice, "populateSearchResults").mockReturnValue({
      type: "panel/populateSearchResults",
    } as any);
  });

  it("should show all items when search is empty", async ({ store }) => {
    await store.dispatch(performSearch());

    expect(selectVisibleIndexes(store.getState())).toEqual([]);
    expect(store.getState().search.searchQuery).toEqual({});
    expect(store.getState().search.searchingStatus).toBe("idle");
  });

  it("should perform search with text only", async ({ store }) => {
    vi.spyOn(services, "searchDataset").mockResolvedValue({
      status: 200,
      body: [1, 2, 3],
      headers: new Headers(),
    });

    store.dispatch(setText("test query"));
    await store.dispatch(performSearch());

    expect(selectVisibleIndexes(store.getState())).toEqual([1, 2, 3]);
    expect(store.getState().search.searchQuery).toEqual({
      filter: [],
      text: "test query",
    });
    expect(store.getState().search.searchingStatus).toBe("idle");
  });

  it("should perform search with filters only", async ({ store }) => {
    vi.spyOn(services, "searchDataset").mockResolvedValue({
      status: 200,
      body: [4, 5],
      headers: new Headers(),
    });

    store.dispatch(setFilterValue({ id: "country_id", value: "FR" }));
    await store.dispatch(performSearch());

    expect(selectVisibleIndexes(store.getState())).toEqual([4, 5]);
    expect(store.getState().search.searchQuery).toEqual({
      filter: ["country_id:FR"],
      text: undefined,
    });
    expect(store.getState().search.searchingStatus).toBe("idle");
  });

  it("should perform search with both text and filters", async ({ store }) => {
    vi.spyOn(services, "searchDataset").mockResolvedValue({
      status: 200,
      body: [6, 7, 8],
      headers: new Headers(),
    });

    store.dispatch(setText("coop"));
    store.dispatch(setFilterValue({ id: "country_id", value: "GB" }));
    store.dispatch(setFilterValue({ id: "typology", value: "BMT10" }));
    await store.dispatch(performSearch());

    expect(selectVisibleIndexes(store.getState())).toEqual([6, 7, 8]);
    expect(store.getState().search.searchQuery).toEqual({
      filter: ["country_id:GB", "typology:BMT10"],
      text: "coop",
    });
    expect(store.getState().search.searchingStatus).toBe("idle");
  });

  it("should trim and lowercase search text", async ({ store }) => {
    vi.spyOn(services, "searchDataset").mockResolvedValue({
      status: 200,
      body: [1],
      headers: new Headers(),
    });

    store.dispatch(setText("  TEST  "));
    await store.dispatch(performSearch());

    expect(store.getState().search.searchQuery.text).toBe("test");
  });

  it("should set loading status during search", async ({ store }) => {
    let statusDuringSearch = "";

    vi.spyOn(services, "searchDataset").mockImplementation(async () => {
      statusDuringSearch = store.getState().search.searchingStatus;
      return {
        status: 200,
        body: [1, 2],
        headers: new Headers(),
      };
    });

    store.dispatch(setText("test"));
    await store.dispatch(performSearch());

    expect(statusDuringSearch).toBe("loading");
    expect(store.getState().search.searchingStatus).toBe("idle");
  });

  it("should handle failed search", async ({ store }) => {
    vi.spyOn(services, "searchDataset").mockResolvedValue({
      status: 500,
      body: undefined,
      headers: new Headers(),
    } as any);

    store.dispatch(setText("test"));
    await store.dispatch(performSearch());

    expect(store.getState().search.searchingStatus).toBe("failed");
    expect(selectVisibleIndexes(store.getState())).toEqual([]);
    expect(store.getState().search.searchQuery).toEqual({});
  });
});

describe<LocalTestContext>("performSearchFromQuery", (it) => {
  beforeEach<LocalTestContext>((context) => {
    const store = makeStore();
    context.store = store;
    store.dispatch(configLoaded(mockConfig));

    vi.spyOn(windowUtils, "getDatasetId").mockReturnValue("test-dataset");

    vi.spyOn(panelSlice, "populateSearchResults").mockReturnValue({
      type: "panel/populateSearchResults",
    } as any);

    // Mock successful search response by default
    vi.spyOn(services, "searchDataset").mockResolvedValue({
      status: 200,
      body: [1, 2, 3],
      headers: new Headers(),
    });
  });

  it("should apply search query with text and filters", async ({ store }) => {
    const searchQuery = {
      filter: ["country_id:FR", "typology:BMT20"],
      text: "housing",
    };

    await store.dispatch(performSearchFromQuery(searchQuery));

    expect(selectText(store.getState())).toBe("housing");
    expect(store.getState().search.filterableVocabProps[0].value).toBe("FR");
    expect(store.getState().search.filterableVocabProps[2].value).toBe("BMT20");
    expect(selectVisibleIndexes(store.getState())).toEqual([1, 2, 3]);
  });

  it("should apply search query with filters only", async ({ store }) => {
    const searchQuery = {
      filter: ["country_id:GB"],
    };

    await store.dispatch(performSearchFromQuery(searchQuery));

    expect(selectText(store.getState())).toBe("");
    expect(store.getState().search.filterableVocabProps[0].value).toBe("GB");
    expect(selectVisibleIndexes(store.getState())).toEqual([1, 2, 3]);
  });

  it("should apply search query with text only", async ({ store }) => {
    const searchQuery = {
      text: "cooperative",
    };

    await store.dispatch(performSearchFromQuery(searchQuery));

    expect(selectText(store.getState())).toBe("cooperative");
    expect(store.getState().search.filterableVocabProps[0].value).toBe("any");
    expect(selectVisibleIndexes(store.getState())).toEqual([1, 2, 3]);
  });

  it("should reset filters not in the query", async ({ store }) => {
    // First set some filters
    store.dispatch(setFilterValue({ id: "country_id", value: "FR" }));
    store.dispatch(setFilterValue({ id: "typology", value: "BMT10" }));

    // Now apply a query that only has one filter
    const searchQuery = {
      filter: ["country_id:GB"],
    };

    await store.dispatch(performSearchFromQuery(searchQuery));

    expect(store.getState().search.filterableVocabProps[0].value).toBe("GB");
    expect(store.getState().search.filterableVocabProps[2].value).toBe("any"); // typology reset
  });

  it("should handle empty search query", async ({ store }) => {
    const searchQuery = {};

    await store.dispatch(performSearchFromQuery(searchQuery));

    expect(selectText(store.getState())).toBe("");
    store.getState().search.filterableVocabProps.forEach((prop) => {
      expect(prop.value).toBe("any");
    });
    // Empty search shows all items (empty array of visible indexes)
    expect(selectVisibleIndexes(store.getState())).toEqual([]);
  });
});
