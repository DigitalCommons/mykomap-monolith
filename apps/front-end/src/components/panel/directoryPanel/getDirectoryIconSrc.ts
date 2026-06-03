import { Config } from "../../../services/types";
import { resolveAssetUrl } from "../../../utils/window-utils";

type CustomMarkers = Config["ui"]["customMarkers"];

type DirectoryIconArgs = {
  optionValue: string;
  customMarkers?: CustomMarkers;
};

// Derives directory icons from the dataset's custom marker config.
// Keeps directory icons aligned with bespoke marker naming without adding a separate mapping.
export const getDirectoryIconSrc = ({
  optionValue,
  customMarkers,
}: DirectoryIconArgs): string | undefined => {
  if (!customMarkers) {
    return undefined;
  }

  // Directory icons shown for top-level categories
  if (optionValue === "any" || optionValue.includes("-")) {
    return undefined;
  }

  const iconIndex = customMarkers.termsToIconIndex?.[optionValue];

  if (iconIndex === undefined) {
    return undefined;
  }

  const iconName = customMarkers.markerIcons?.[iconIndex];

  // Exclude the default marker from directory icons
  if (!iconName || iconName === "default") {
    return undefined;
  }

  // For URL-like references (http(s) or dataset:) use the resolved URL as the
  // directory icon too — the same image doubles as marker and directory icon.
  // For bundled names, keep the original `icon-${name}.png` style
  if (/^(https?:)?\/\//.test(iconName) || iconName.startsWith("dataset:")) {
    return resolveAssetUrl(iconName);
  }

  return `./assets/icons/icon-${iconName}.png`;
};
