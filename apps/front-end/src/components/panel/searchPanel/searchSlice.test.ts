import { configLoaded } from "../../../app/vocabsSlice";
import {
  searchSlice,
  selectFilterOptions,
  setFilterValue,
} from "./searchSlice";
import mockConfig from "../../../data/mockConfig";

const reducer = searchSlice.reducer;

describe("config load", () => {
  test("should populate filterable fields", () => {
    expect(
      reducer(
        {
          text: "",
          visibleIndexes: [],
          searchingStatus: "idle",
          filterableFields: [],
        },
        configLoaded(mockConfig),
      ),
    ).toEqual({
      text: "",
      visibleIndexes: [],
      searchingStatus: "idle",
      filterableFields: [
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
          id: "organisational_structure",
          titleUri: "ui:organisational_structure",
          value: "any",
          vocabUri: "os",
        },
        {
          id: "typology",
          titleUri: "ui:typology",
          value: "any",
          vocabUri: "bmt",
        },
      ],
    });
  });
});

describe("selectFilterOptions", () => {
  const state = {
    search: {
      text: "",
      visibleIndexes: [],
      searchingStatus: "idle",
      filterableFields: [
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
    vocabs: {
      language: "en",
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
        title: "country_id", // TODO expect a translated title
        options: [
          { value: "any", label: "- Any -" },
          { value: "GB", label: "United Kingdom" },
          { value: "FR", label: "France" },
        ],
        value: "any",
      },
      {
        id: "primary_activity",
        title: "primary_activity", // TODO expect a translated title
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
        vocabs: { ...state.vocabs, language: "fr" },
      }),
    ).toEqual([
      {
        id: "country_id",
        title: "country_id", // TODO expect a translated title
        options: [
          { value: "any", label: "- Any -" },
          { value: "GB", label: "Royaume-Uni" },
          { value: "FR", label: "France" },
        ],
        value: "any",
      },
      {
        id: "primary_activity",
        title: "primary_activity", // TODO expect a translated title
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
          filterableFields: [
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
        setFilterValue({ id: "country_id", value: "fr" }),
      ),
    ).toEqual({
      text: "",
      visibleIndexes: [],
      searchingStatus: "idle",
      filterableFields: [
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
    });
  });

  test("change a filter that was already set", () => {
    expect(
      reducer(
        {
          text: "",
          visibleIndexes: [],
          searchingStatus: "idle",
          filterableFields: [
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
        },
        setFilterValue({ id: "country_id", value: "gb" }),
      ),
    ).toEqual({
      text: "",
      visibleIndexes: [],
      searchingStatus: "idle",
      filterableFields: [
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
    });
  });
});
