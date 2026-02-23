import communityGrowingIcon from "/assets/icons/powys/icon-community-growing.png";
import emergencyFoodIcon from "/assets/icons/powys/icon-emergency-food.png";
import eventsIcons from "/assets/icons/powys/icon-events.png";
import localFoodIcon from "/assets/icons/powys/icon-local-food.png";

// Temporary file for directory icon mapping using vocab term IDs.
// Config driven mapping to be implemented once issue 244 is resolved

export const PRIMARY_CATEGORY_ICONS: Record<string, string> = {
  ep: emergencyFoodIcon,
  cg: communityGrowingIcon,
  lp: localFoodIcon,
  ev: eventsIcons,
};
