import { Buffer } from "buffer";
import { Iso639Set1Codes } from "@mykomap/common";

const getUrlSearchParam = (param: string): string | null =>
  new URLSearchParams(window.location.search).get(param);

export const getDatasetId = () => getUrlSearchParam("datasetId");

/**
 * Maps a config-supplied asset reference to a fetchable URL.
 *
 * Resolution rules:
 *   - `dataset:<path>`  → `${VITE_API_URL}/dataset/${datasetId}/<path>`
 *     (assets shipped inside the dataset directory; backwards-compatible
 *     opt-in scheme).
 *   - Anything else (http(s)://, protocol-relative //, leading `./` or `/`,
 *     or a bare relative path) passes through unchanged — preserving the
 *     existing behaviour where logos live in the front-end's static assets.
 *
 * Returns `undefined` for `undefined`/`null`/empty input, or for `dataset:`
 * paths when no datasetId is present in the URL.
 */
export const resolveAssetUrl = (
  ref: string | undefined | null,
): string | undefined => {
  if (!ref) return undefined;
  if (!ref.startsWith("dataset:")) return ref;
  const datasetId = getDatasetId();
  if (!datasetId) return undefined;
  const path = ref.slice("dataset:".length).replace(/^\/+/, "");
  return `${import.meta.env.VITE_API_URL}/dataset/${encodeURIComponent(datasetId)}/${path}`;
};

/** Get language from URL param and fallback to English */
export const getLanguageFromUrl = (): string => {
  const lang = getUrlSearchParam("lang")?.toLowerCase();
  return lang && Iso639Set1Codes.hasOwnProperty(lang) ? lang : "en";
};

export const encodeBase64 = (data: string) => {
  return Buffer.from(data, "utf-8").toString("base64");
};
