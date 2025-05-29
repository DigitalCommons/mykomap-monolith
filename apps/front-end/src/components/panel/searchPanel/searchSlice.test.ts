import { configLoaded } from "../../../app/configSlice";
import {
  searchSlice,
  selectFilterOptions,
  setFilterValue,
} from "./searchSlice";
import mockConfig from "../../../data/mockConfig";

const reducer = searchSlice.reducer;

describe("config load", () => {
  test("should populate filterableVocabProps", () => {
    expect(
      reducer(
        {
          text: "",
          visibleIndexes: [],
          searchingStatus: "idle",
          filterableVocabProps: [],
          searchQuery: {},
        },
        configLoaded(mockConfig),
      ),
    ).toEqual({
      text: "",
      visibleIndexes: [],
      searchingStatus: "idle",
      filterableVocabProps: [
        {
          id: "country_id",
          titleUri: undefined,
          value: "any",
          vocabUri: "coun",
        },
        {
          id: "primary_activity",
          titleUri: "ui:primary_activity",
          value: "any",
          vocabUri: "aci",
        },
        {
          id: "typology",
          titleUri: "ui:typology",
          value: "any",
          vocabUri: "bmt",
        },
        {
          id: "data_sources",
          titleUri: undefined,
          value: "any",
          vocabUri: "dso",
        },
      ],
      searchQuery: {},
    });
  });
});

describe("selectFilterOptions", () => {
  const state = {
    search: {
      text: "",
      visibleIndexes: [],
      searchingStatus: "idle",
      filterableVocabProps: [
        {
          id: "country_id",
          titleUri: undefined,
          value: "any",
          vocabUri: "coun",
        },
        {
          id: "primary_activity",
          titleUri: "ui:primary_activity",
          value: "any",
          vocabUri: "aci",
        },
      ],
    },
    config: {
      currentLanguage: "en",
      languages: ["en", "fr"],
      vocabs: {
        aci: {
          en: {
            title: "Economic Activity",
            terms: {
              ICA210: "Housing",
              ICA220: "Transport",
              ICA230: "Utilities",
            },
          },
          fr: {
            title: "Secteur économique",
            terms: {
              ICA210: "Logement",
              ICA220: "Transports",
              ICA230: "Services publics",
            },
          },
        },
        coun: {
          en: {
            title: "Country",
            terms: {
              GB: "United Kingdom",
              FR: "France",
            },
          },
          fr: {
            title: "Pays",
            terms: {
              GB: "Royaume-Uni",
              FR: "France",
            },
          },
        },
        ui: {
          en: {
            title: "Translations",
            terms: {
              primary_activity: "Primary Activity",
            },
          },
          fr: {
            title: "Traductions",
            terms: {
              primary_activity: "Activité principale",
            },
          },
        },
      },
    },
  };

  test("English language", () => {
    expect(selectFilterOptions(state)).toEqual([
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
    ]);
  });

  test("French language", () => {
    expect(
      selectFilterOptions({
        ...state,
        config: { ...state.config, currentLanguage: "fr" },
      }),
    ).toEqual([
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
    ]);
  });
});

describe("setFilterValue", () => {
  test("set a filter that was unset", () => {
    expect(
      reducer(
        {
          text: "",
          visibleIndexes: [],
          searchingStatus: "idle",
          filterableVocabProps: [
            {
              id: "country_id",
              titleUri: undefined,
              value: "any",
              vocabUri: "coun",
            },
            {
              id: "primary_activity",
              titleUri: "ui:primary_activity",
              value: "any",
              vocabUri: "aci",
            },
          ],
          searchQuery: {},
        },
        setFilterValue({ id: "country_id", value: "fr" }),
      ),
    ).toEqual({
      text: "",
      visibleIndexes: [],
      searchingStatus: "idle",
      filterableVocabProps: [
        {
          id: "country_id",
          titleUri: undefined,
          value: "fr",
          vocabUri: "coun",
        },
        {
          id: "primary_activity",
          titleUri: "ui:primary_activity",
          value: "any",
          vocabUri: "aci",
        },
      ],
      searchQuery: {},
    });
  });

  test("change a filter that was already set", () => {
    expect(
      reducer(
        {
          text: "",
          visibleIndexes: [],
          searchingStatus: "idle",
          filterableVocabProps: [
            {
              id: "country_id",
              titleUri: undefined,
              value: "fr",
              vocabUri: "coun",
            },
            {
              id: "primary_activity",
              titleUri: "ui:primary_activity",
              value: "any",
              vocabUri: "aci",
            },
          ],
          searchQuery: {},
        },
        setFilterValue({ id: "country_id", value: "gb" }),
      ),
    ).toEqual({
      text: "",
      visibleIndexes: [],
      searchingStatus: "idle",
      filterableVocabProps: [
        {
          id: "country_id",
          titleUri: undefined,
          value: "gb",
          vocabUri: "coun",
        },
        {
          id: "primary_activity",
          titleUri: "ui:primary_activity",
          value: "any",
          vocabUri: "aci",
        },
      ],
      searchQuery: {},
    });
  });
});

// Test sorting of filter options
describe("sort filter options", () => {
  // Mock configuration for testing - non alphabetical order
  const baseConfig = {
    currentLanguage: "en",
    vocabs: {
      aci: {
        en: {
          title: "Economic Activity",
          terms: {
            ICA220: "Transport",
            ICA210: "Housing",
            ICA230: "Utilities",
          },
        },
      },
      coun: {
        en: {
          title: "Country",
          terms: {
            GB: "United Kingdom",
            FR: "France",
          },
        },
      },
      ui: {
        en: {
          title: "Translations",
          terms: {
            primary_activity: "Primary Activity",
            typology: "Typology",
            country_id: "Country",
          },
        },
      },
    },
  };

  const getBaseState = (filterableVocabProps: any[]) => ({
    search: {
      text: "",
      visibleIndexes: [],
      searchingStatus: "idle",
      filterableVocabProps,
    },
    config: structuredClone(baseConfig),
  });

  // Test default sorting (no sort specified)
  test("sort options ascending order by default", () => {
    const state = getBaseState([
      {
        id: "primary_activity",
        titleUri: "ui:primary_activity",
        value: "any",
        vocabUri: "aci",
      },
      {
        id: "country_id",
        titleUri: "ui:country_id",
        value: "any",
        vocabUri: "coun",
      },
    ]);

    expect(selectFilterOptions(state)).toEqual([
      {
        id: "primary_activity",
        title: "Primary Activity",
        options: [
          { value: "any", label: "- any -" },
          { value: "ICA210", label: "Housing" },
          { value: "ICA220", label: "Transport" },
          { value: "ICA230", label: "Utilities" },
        ],
        value: "any",
      },
      {
        id: "country_id",
        title: "Country",
        options: [
          { value: "any", label: "- any -" },
          { value: "FR", label: "France" },
          { value: "GB", label: "United Kingdom" },
        ],
        value: "any",
      },
    ]);
  });

  // Test ascending sort
  test("sort options ascending order", () => {
    const state = getBaseState([
      {
        id: "primary_activity",
        titleUri: "ui:primary_activity",
        value: "any",
        vocabUri: "aci",
        sorted: "asc",
      },
      {
        id: "country_id",
        titleUri: "ui:country_id",
        value: "any",
        vocabUri: "coun",
        sorted: "asc",
      },
    ]);

    expect(selectFilterOptions(state)).toEqual([
      {
        id: "primary_activity",
        title: "Primary Activity",
        options: [
          { value: "any", label: "- any -" },
          { value: "ICA210", label: "Housing" },
          { value: "ICA220", label: "Transport" },
          { value: "ICA230", label: "Utilities" },
        ],
        value: "any",
      },
      {
        id: "country_id",
        title: "Country",
        options: [
          { value: "any", label: "- any -" },
          { value: "FR", label: "France" },
          { value: "GB", label: "United Kingdom" },
        ],
        value: "any",
      },
    ]);
  });

  // Test descending sort
  test("sort options descending order", () => {
    const state = getBaseState([
      {
        id: "primary_activity",
        titleUri: "ui:primary_activity",
        value: "any",
        vocabUri: "aci",
        sorted: "desc",
      },
      {
        id: "country_id",
        titleUri: "ui:country_id",
        value: "any",
        vocabUri: "coun",
        sorted: "desc",
      },
    ]);

    expect(selectFilterOptions(state)).toEqual([
      {
        id: "primary_activity",
        title: "Primary Activity",
        options: [
          { value: "any", label: "- any -" },
          { value: "ICA230", label: "Utilities" },
          { value: "ICA220", label: "Transport" },
          { value: "ICA210", label: "Housing" },
        ],
        value: "any",
      },
      {
        id: "country_id",
        title: "Country",
        options: [
          { value: "any", label: "- any -" },
          { value: "GB", label: "United Kingdom" },
          { value: "FR", label: "France" },
        ],
        value: "any",
      },
    ]);
  });

  // Test sort options set to false
  test("sort options set to false", () => {
    const state = getBaseState([
      {
        id: "primary_activity",
        titleUri: "ui:primary_activity",
        value: "any",
        vocabUri: "aci",
        sorted: false,
      },
      {
        id: "country_id",
        titleUri: "ui:country_id",
        value: "any",
        vocabUri: "coun",
        sorted: false,
      },
    ]);

    expect(selectFilterOptions(state)).toEqual([
      {
        id: "primary_activity",
        title: "Primary Activity",
        options: [
          { value: "any", label: "- any -" },
          { value: "ICA220", label: "Transport" },
          { value: "ICA210", label: "Housing" },
          { value: "ICA230", label: "Utilities" },
        ],
        value: "any",
      },
      {
        id: "country_id",
        title: "Country",
        options: [
          { value: "any", label: "- any -" },
          { value: "GB", label: "United Kingdom" },
          { value: "FR", label: "France" },
        ],
        value: "any",
      },
    ]);
  });
});
