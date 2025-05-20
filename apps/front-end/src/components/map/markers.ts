import defaultMarker from "./markers/map-marker.png";
import communityGrowingMarker from "./markers/community-growing-marker.png";
import emergencyFoodMarker from "./markers/emergency-food-marker.png";
import eventsMarker from "./markers/events-marker.png";
import localFoodMarker from "./markers/local-food-marker.png";

//when adding new markers, ensure default is still the last entry
const markers = {
  "fs:cg": communityGrowingMarker,
  "fs:ef": emergencyFoodMarker,
  "fs:ev": eventsMarker,
  "fs:lm": localFoodMarker,
  "default-marker": defaultMarker,
}

export default markers;
