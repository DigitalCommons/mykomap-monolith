import { Config } from "../services";

const mockConfig: Config = {
  prefixes: {
    "https://dev.lod.coop/essglobal/2.1/standard/activities-ica/": "aci",
    "https://dev.lod.coop/essglobal/2.1/standard/base-membership-type/": "bmt",
    "https://dev.lod.coop/essglobal/2.1/standard/organisational-structure/":
      "os",
  },
  languages: ["en", "fr"],
  ui: {
    directory_panel_field: "country_id",
  },
  itemProps: {
    id: {
      type: "value",
    },
    name: {
      type: "value",
    },
    description: { type: "value" },
    lat: {
      type: "value",
    },
    lng: {
      type: "value",
    },
    address: {
      type: "value",
    },
    website: {
      type: "multi",
      of: {
        type: "value",
      },
    },
    dc_domains: {
      type: "multi",
      of: { type: "value" },
    },
    country_id: {
      type: "vocab",
      uri: "coun:",
      filter: true,
    },
    primary_activity: {
      type: "vocab",
      uri: "aci:",
      titleUri: "ui:primary_activity",
      filter: true,
    },
    organisational_structure: {
      type: "vocab",
      uri: "os:",
      titleUri: "ui:organisational_structure",
    },
    typology: {
      type: "vocab",
      uri: "bmt:",
      titleUri: "ui:typology",
      filter: true,
    },
    data_sources: {
      type: "multi",
      of: { type: "vocab", uri: "dso:" },
      filter: true,
    },
  },
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
    bmt: {
      en: {
        title: "Typology",
        terms: {
          BMT10: "Consumer/Users",
          BMT20: "Producers",
          BMT30: "Workers",
        },
      },
      fr: {
        title: "Typologie",
        terms: {
          BMT10: "Consommateurs/usagers",
          BMT20: "Producteurs",
          BMT30: "Travailleurs",
        },
      },
    },
    os: {
      en: {
        title: "Structure Type",
        terms: {
          OS60: "Workers cooperative",
          OS80: "Consumer/User coops",
          OS90: "Producer cooperative",
        },
      },
      fr: {
        title: "Type de structure",
        terms: {
          OS50: "Entreprise (autre)",
          OS60: "Coopératives de travail associé",
          OS80: "Coopératives de consommateurs",
          OS90: "Coopératives de producteurs",
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
    dso: {
      en: {
        title: "Data Source",
        terms: {
          CUK: "Co-operatives UK",
          DC: "DotCoop",
          ICA: "International Cooperative Alliance",
          NCBA: "National Cooperative Business Association (USA)",
        },
      },
      fr: {
        title: "Source de données",
        terms: {
          CUK: "Co-operatives UK",
          DC: "DotCoop",
          ICA: "Alliance coopérative internationale",
          NCBA: "National Cooperative Business Association (USA)",
        },
      },
    },
    ui: {
      en: {
        title: "Translations",
        terms: {
          primary_activity: "Primary Activity",
          organisational_structure: "Organisational Structure",
          typology: "Typology",
        },
      },
      fr: {
        title: "Traductions",
        terms: {
          primary_activity: "Activité principale",
          organisational_structure: "Structure organisationnelle",
          typology: "Typologie",
        },
      },
    },
  },
  popup: {
    titleProp: "name",
    leftPane: [],
    topRightPane: [],
    bottomRightPane: []
  }
};

export default mockConfig;
