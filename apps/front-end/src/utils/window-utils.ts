import { Iso639Set1Codes } from "@mykomap/common";

export const getUrlSearchParam = (param: string): string | null =>
  new URLSearchParams(window.location.search).get(param);

/** Get language from URL param and fallback to English */
export const getLanguageFromUrl = (): string => {
  const lang = getUrlSearchParam("lang")?.toLowerCase();
  return lang && Iso639Set1Codes.hasOwnProperty(lang) ? lang : "en";
};
