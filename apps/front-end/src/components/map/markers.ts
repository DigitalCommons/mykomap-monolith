import defaultMarker from "./markers/map-marker.png";
import dotCoopMarker from "./markers/dotcoop-marker.png";
// import communityGrowingMarker from "./markers/community-growing-marker.png";
// import emergencyFoodMarker from "./markers/emergency-food-marker.png";
// import eventsMarker from "./markers/events-marker.png";
// import localFoodMarker from "./markers/local-food-marker.png";

// When adding new markers, ensure default is still the last entry. FIXME These labels
// are hardwired and this is just a temporary situation, to be rectified later.
// See comments here:
// https://github.com/DigitalCommons/mykomap-monolith/pull/155#discussion_r2144547335
//
// The order should match the definition of terms in the vocab property named by
// config.json's ui.marker_property_name value. There should be one extra icon
// for cases which take multple values, if these cases exist.
//
// For CWM dataset: uses data_sources (ods vocab) for markers
// Index mapping: 0=NCBA, 1=DC, 2=ICA, 3=USDA, 4=NCG, 5=FICU, 6=FCA, 7=CUK,
// 8=USFWC, 9=CMC, 10=IFFCO, 11=ICS, 12=ACMEI, 13=WC, 14=NCUI, 15=COOPERAR,
// 16=EUROCOOP, 17=YCC, 18=Multiple values
const markers = [
  defaultMarker, // 0: NCBA
  dotCoopMarker, // 1: DC (DotCoop verified)
  defaultMarker, // 2: ICA
  defaultMarker, // 3: USDA
  defaultMarker, // 4: NCG
  defaultMarker, // 5: FICU
  defaultMarker, // 6: FCA
  defaultMarker, // 7: CUK
  defaultMarker, // 8: USFWC
  defaultMarker, // 9: CMC
  defaultMarker, // 10: IFFCO
  defaultMarker, // 11: ICS
  defaultMarker, // 12: ACMEI
  defaultMarker, // 13: WC
  defaultMarker, // 14: NCUI
  defaultMarker, // 15: COOPERAR
  defaultMarker, // 16: EUROCOOP
  defaultMarker, // 17: YCC
  defaultMarker, // 18: Multiple values without DC (multi-values with DC show dotCoop at index 1)
  defaultMarker, // 19: Default marker (must be last)
  // Powys variant markers:
  // emergencyFoodMarker, // "ep": "Emergency food provision",
  // emergencyFoodMarker, // "ep-fb": " - Food bank",
  // emergencyFoodMarker, // "ep-cf": " - Community fridge",
  // emergencyFoodMarker, // "ep-pm": " - Pay as you feel meals",
  // emergencyFoodMarker, // "ep-cf": " - Community food share",
  // communityGrowingMarker, // "cg": "Community growing",
  // communityGrowingMarker, // "cg-ie": " - Incredible Edible",
  // communityGrowingMarker, // "cg-ga": " - Community garden",
  // communityGrowingMarker, // "cg-or": " - Community orchard",
  // communityGrowingMarker, // "cg-al": " - Allotments",
  // localFoodMarker, // "lp": "Local food provider",
  // localFoodMarker, // "lp-gr": " - Farmer/grower",
  // localFoodMarker, // "lp-cr": " - Cafe/restaurant",
  // localFoodMarker, // "lp-mk": " - Market",
  // localFoodMarker, // "lp-sp": " - Shop",
  // eventsMarker, // "ev": "Events",
  // eventsMarker, // "ev-ff": " - Food festival",
  // eventsMarker, // "ev-cc": " - Cooking classes"
  // defaultMarker, // No multi-category case anticipated
];

export default markers;
