import defaultMarker from "./markers/map-marker.png";
import communityGrowingMarker from "./markers/community-growing-marker.png";
import emergencyFoodMarker from "./markers/emergency-food-marker.png";
import eventsMarker from "./markers/events-marker.png";
import localFoodMarker from "./markers/local-food-marker.png";
import dotcoopMarker from "./markers/map-marker.png";

const allMarkers: { [key: string]: string } = {
  "emergencyFoodMarker": emergencyFoodMarker,
  "communityGrowingMarker": communityGrowingMarker,
  "localFoodMarker": localFoodMarker,
  "eventsMarker": eventsMarker,
  "dotcoopMarker": dotcoopMarker,
  "defaultMarker": defaultMarker
}

export default allMarkers;
