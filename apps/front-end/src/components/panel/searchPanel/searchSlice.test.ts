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
          { value: "any", label: "- Any -" },
          { value: "GB", label: "United Kingdom" },
          { value: "FR", label: "France" },
        ],
        value: "any",
      },
      {
        id: "primary_activity",
        title: "Primary Activity",
        options: [
          { value: "any", label: "- Any -" },
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
          { value: "any", label: "- Any -" },
          { value: "GB", label: "Royaume-Uni" },
          { value: "FR", label: "France" },
        ],
        value: "any",
      },
      {
        id: "primary_activity",
        title: "Activité principale",
        options: [
          { value: "any", label: "- Any -" }, // TODO expect translated 'Any'
          { value: "ICA210", label: "Logement" },
          { value: "ICA220", label: "Transports" },
          { value: "ICA230", label: "Services publics" },
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
