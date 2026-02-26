import defaultMarker from "./markers/map-marker.png";
import communityGrowingMarker from "./markers/community-growing-marker.png";
import emergencyFoodMarker from "./markers/emergency-food-marker.png";
import eventsMarker from "./markers/events-marker.png";
import localFoodMarker from "./markers/local-food-marker.png";

const allMarkers: { [key: string]: string } = {
  "emergencyFoodMarker": emergencyFoodMarker,
  "communityGrowingMarker": communityGrowingMarker,
  "localFoodMarker": localFoodMarker,
  "eventsMarker": eventsMarker,
  "defaultMarker": defaultMarker
}

export default allMarkers;
