import defaultMarker from "./markers/map-marker.png";
import communityGrowingMarker from "./markers/community-growing-marker.png";
import emergencyFoodMarker from "./markers/emergency-food-marker.png";
import eventsMarker from "./markers/events-marker.png";
import localFoodMarker from "./markers/local-food-marker.png";

//when adding new markers, ensure default is still the last entry these labels
//are hardwired and this is just a temporary situation, to be rectified later
//
// The order should match the definition of terms in the vocab property named by
// config.json's ui.marker_property_name value. There should be one extra icon
// for cases which take multple values, if these cases exist.
const markers = [
  emergencyFoodMarker, // "ep": "Emergency food provision",
  emergencyFoodMarker, // "ep-fb": " - Food bank",
  emergencyFoodMarker, // "ep-cf": " - Community fridge",
  emergencyFoodMarker, // "ep-pm": " - Pay as you feel meals",
  emergencyFoodMarker, // "ep-cf": " - Community food share",
  communityGrowingMarker, // "cg": "Community growing",
  communityGrowingMarker, // "cg-ie": " - Incredible Edible",
  communityGrowingMarker, // "cg-ga": " - Community garden",
  communityGrowingMarker, // "cg-or": " - Community orchard",
  communityGrowingMarker, // "cg-al": " - Allotments",
  localFoodMarker, // "lp": "Local food provider",
  localFoodMarker, // "lp-gr": " - Farmer/grower",
  localFoodMarker, // "lp-cr": " - Cafe/restaurant",
  localFoodMarker, // "lp-mk": " - Market",
  localFoodMarker, // "lp-sp": " - Shop",
  eventsMarker, // "ev": "Events",
  eventsMarker, // "ev-ff": " - Food festival",
  eventsMarker, // "ev-cc": " - Cooking classes"
  defaultMarker, // No multi-category case anticipated
];

export default markers;
