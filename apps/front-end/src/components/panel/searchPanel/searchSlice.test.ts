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
} from "./searchSlice";
import mockConfig from "../../../mockApiResponses/mockConfig";

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
