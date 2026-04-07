import { Config } from "../../../services/types";

type CustomMarkers = Config["ui"]["customMarkers"];
type ItemProps = Config["itemProps"];
type Vocabs = Config["vocabs"];

type GetMarkerLabelsByIconIndexArgs = {
  customMarkers?: CustomMarkers;
  itemProps?: ItemProps;
  vocabs: Vocabs;
  currentLanguage: string;
};

export const getMarkerLabelsByIconIndex = ({
  customMarkers,
  itemProps,
  vocabs,
  currentLanguage,
}: GetMarkerLabelsByIconIndexArgs): Record<number, string> => {
  const markerPropertyName = customMarkers?.marker_property_name;
  const termsToIconIndex = customMarkers?.termsToIconIndex;

  if (!markerPropertyName || !termsToIconIndex || !itemProps) {
    return {};
  }

  const markerItemProp = itemProps[markerPropertyName];

  const vocabId =
    markerItemProp?.type === "vocab"
      ? markerItemProp.uri?.replace(":", "")
      : undefined;

  if (!vocabId) {
    return {};
  }

  const vocab = vocabs[vocabId];
  const termsInCurrentLanguage =
    vocab?.[currentLanguage]?.terms ?? Object.values(vocab ?? {})[0]?.terms;

  // Use only top-level vocab terms for the key, not nested child terms like "ep-fb".
  return Object.entries(termsToIconIndex).reduce(
    (acc, [term, iconIndex]) => {
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
