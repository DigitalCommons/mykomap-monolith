import communityGrowingIcon from "/assets/icons/powys/icon-community-growing.png";
import emergencyFoodIcon from "/assets/icons/powys/icon-emergency-food.png";
import eventsIcons from "/assets/icons/powys/icon-events.png";
import localFoodIcon from "/assets/icons/powys/icon-local-food.png";

// Temporary file for directory icon mapping using vocab term IDs.
// Config driven mapping to be implemented once issue 244 is resolved

interface PrimaryCategoryIcons {
  icon: string;
  color: string;
}

export const PRIMARY_CATEGORY_ICONS: Record<string, PrimaryCategoryIcons> = {
  ep: {
    icon: emergencyFoodIcon,
    color: "#890303",
  },
  cg: {
    icon: communityGrowingIcon,
    color: "#6CA42D",
  },
  lp: {
    icon: localFoodIcon,
    color: "#F67D00",
  },
  ev: {
    icon: eventsIcons,
    color: "#2F426C",
  },
};
