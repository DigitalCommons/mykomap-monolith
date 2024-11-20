import i18n, { Resource, ResourceLanguage } from "i18next";
import HttpBackend, { HttpBackendOptions } from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
import { getDatasetId } from "./utils/window-utils";
import { Config } from "./services";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init<HttpBackendOptions>({
    backend: {
      // Load the config for the dataset from the API, then parse it to extract i18n resources from
      // the ui vocab
      loadPath: `${import.meta.env.VITE_API_URL}/dataset/${getDatasetId()}/config`,
      parse: (data, languages, namespaces): Resource | ResourceLanguage => {
        const config = JSON.parse(data) as Config;
        const uiVocab = config.vocabs.ui;

        // loading 1 language
        if (typeof languages === "string") {
          // loading only the ui namespace
          if (namespaces === "ui") return uiVocab[languages].terms;

          // trying to load multiple namespaces, and one of them is ui (the only one we support)
          if (namespaces instanceof Array && namespaces.includes("ui")) {
            return { ui: uiVocab[languages].terms };
          }
          return {};
        }

        // loading multiple languages
        if (namespaces instanceof Array && namespaces.includes("ui")) {
          const resources: Resource = {};
          for (const lang in languages) {
            if (lang in uiVocab) {
              resources[lang] = { ui: uiVocab[lang].terms };
            } else {
              console.error(`No UI vocab for language ${lang}`);
              resources[lang] = { ui: {} };
            }
          }
          return resources;
        }
        return {};
      },
      crossDomain: import.meta.env.DEV,
    },
    detection: {
      lookupQuerystring: "lang",
      convertDetectedLanguage: (lng) => lng.toLowerCase(),
    },
    react: {
      useSuspense: false,
    },
    debug: import.meta.env.DEV,
    ns: ["ui"],
    defaultNS: "ui",
    nsSeparator: ":",
    fallbackLng: ["en", "dev"],
  });

export default i18n;
