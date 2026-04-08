import { Config } from "../../../services/types";

type CustomMarkers = Config["ui"]["customMarkers"];
type ItemProps = Config["itemProps"];
type Vocabs = Config["vocabs"];

type MarkerLabelArgs = {
  customMarkers?: CustomMarkers;
  itemProps?: ItemProps;
  vocabs: Vocabs;
  currentLanguage: string;
};

type LocalisedVocab = {
  title: string;
  terms: Record<string, string>;
};

export const getMarkerLabelsByIconIndex = ({
  customMarkers,
  itemProps,
  vocabs,
  currentLanguage,
}: MarkerLabelArgs): Record<number, string> => {
  const markerPropertyName = customMarkers?.marker_property_name;
  const termsToIconIndex = customMarkers?.termsToIconIndex;

  if (!markerPropertyName || !termsToIconIndex || !itemProps) {
    return {};
  }

  // The marker property may be either a direct vocab field or a multi field containing vocab terms.
  // For example:
  // - Powys: primary_food_system_category -> type "vocab" -> uri "fsc:"
  // - CWM: data_sources -> type "multi" -> of.type "vocab" -> uri "ods:"
  const markerItemProp = itemProps[markerPropertyName];
  const vocabId =
    markerItemProp?.type === "vocab"
      ? markerItemProp.uri?.replace(":", "")
      : markerItemProp?.type === "multi" && markerItemProp.of?.type === "vocab"
        ? markerItemProp.of.uri?.replace(":", "")
        : undefined;

  if (!vocabId) {
    return {};
  }

  // Prefer labels in the current language, but fall back to the first available vocab language
  // so the key still renders if a translation is missing.
  const vocab = vocabs[vocabId];

  const fallbackVocab = vocab
    ? (Object.values(vocab)[0] as LocalisedVocab | undefined)
    : undefined;

  const termsInCurrentLanguage =
    vocab?.[currentLanguage]?.terms ?? fallbackVocab?.terms;

  return Object.entries(termsToIconIndex).reduce<Record<number, string>>(
    (acc, [term, rawIconIndex]) => {
      const iconIndex = Number(rawIconIndex);
      // Only use top-level terms for the key.
      // In Powys, child terms are hyphenated (e.g. "ep-fb", "cg-ie"), so we exclude them here.
      // This assumes hyphenated terms represent children rather than primary categories.
      if (term === "default" || term.includes("-")) {
        return acc;
      }

      const label = termsInCurrentLanguage?.[term];

      if (label && acc[iconIndex] === undefined) {
        acc[iconIndex] = label;
      }

      return acc;
    },
    {} as Record<number, string>,
  );
};
