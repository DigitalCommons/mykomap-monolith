import { Config } from "../../../services/types";

type CustomMarkers = Config["ui"]["customMarkers"];

type DirectoryIconArgs = {
  optionValue: string;
  customMarkers?: CustomMarkers;
};

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

  return `./assets/icons/icon-${iconName}.png`;
};
