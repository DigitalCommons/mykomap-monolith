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

  // For URL-like references (http(s) or dataset:), derive the directory-icon
  // URL from the marker URL using the same convention as bundled names —
  // `…/markers/X.png` becomes `…/icons/icon-X.png`. The dataset must ship both
  // variants in its assets/ tree (the marker for the map, the icon for the
  // directory). If only the marker is shipped, the directory icon will 404
  // and the directory will render a broken image — fix by adding the
  // matching `assets/icons/icon-X.png` to the dataset.
  if (/^(https?:)?\/\//.test(iconName) || iconName.startsWith("dataset:")) {
    const iconUrl = iconName.replace(
      /markers\/([^/]+)\.png$/,
      "icons/icon-$1.png",
    );
    return resolveAssetUrl(iconUrl);
  }

  return `./assets/icons/icon-${iconName}.png`;
};
