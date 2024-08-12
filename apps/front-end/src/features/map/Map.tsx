import React, { useRef, useEffect, useState } from "react";
import { createMap } from "./mapSetup";

const Map = () => {
  useEffect(() => {
    const map = createMap();

    // Clean up on unmount
    return () => map.remove();
  }, []);

  return (
    <div
      id="map-container"
      className="absolute bottom-0 left-0 right-0 top-0 overflow-hidden text-center"
    />
  );
};

export default Map;
