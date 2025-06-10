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
  emergencyFoodMarker, // CAT10
  communityGrowingMarker, // CAT20
  localFoodMarker, // CAT30
  eventsMarker, // CAT40
  // No multi-category case anticipated
];

export default markers;
