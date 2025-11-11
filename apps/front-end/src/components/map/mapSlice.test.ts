import type { AppStore } from "../../app/store";
import { makeStore } from "../../app/store";
import {
  mapSlice,
  fetchLocations,
  selectTotalItemsCount,
  selectLocation,
  selectFeatures,
} from "./mapSlice";

interface LocalTestContext {
  store: AppStore;
}

// Mock dataset locations for testing
const mockLocations = [
  [0.1276, 51.5074, "marker1"], // London
  [-0.1181, 51.5099, "marker2"], // London (different location)
  [2.3522, 48.8566, "marker3"], // Paris
  [-74.006, 40.7128, "marker4"], // New York
];

describe<LocalTestContext>("map reducer", (it) => {
  beforeEach<LocalTestContext>((context) => {
    const store = makeStore();
    context.store = store;
  });

  it("should handle initial state", () => {
    expect(mapSlice.reducer(undefined, { type: "unknown" })).toStrictEqual({
      allLocations: [],
      status: "loading",
    });
  });

  it("should handle fetchLocations pending", ({ store }) => {
    expect(store.getState().map.status).toBe("loading");

    store.dispatch({
      type: "map/fetchLocations/pending",
      meta: { arg: undefined, requestId: "test", requestStatus: "pending" },
    });

    expect(store.getState().map.status).toBe("loading");
  });

  it("should handle fetchLocations fulfilled", ({ store }) => {
    expect(store.getState().map.status).toBe("loading");
    expect(store.getState().map.allLocations).toEqual([]);

    store.dispatch({
      type: "map/fetchLocations/fulfilled",
      payload: mockLocations,
      meta: { arg: undefined, requestId: "test", requestStatus: "fulfilled" },
    });

    expect(store.getState().map.status).toBe("loaded");
    expect(store.getState().map.allLocations).toEqual(mockLocations);
  });

  it("should handle fetchLocations rejected", ({ store }) => {
    expect(store.getState().map.status).toBe("loading");

    store.dispatch({
      type: "map/fetchLocations/rejected",
      payload: "Failed to fetch locations",
      meta: { arg: undefined, requestId: "test", requestStatus: "rejected" },
    });

    expect(store.getState().map.status).toBe("failed");
    expect(store.getState().map.allLocations).toEqual([]);
  });

  it("should select total items count correctly", ({ store }) => {
    expect(selectTotalItemsCount(store.getState())).toBe(0);

    // Add locations
    store.dispatch({
      type: "map/fetchLocations/fulfilled",
      payload: mockLocations,
      meta: { arg: undefined, requestId: "test", requestStatus: "fulfilled" },
    });

    expect(selectTotalItemsCount(store.getState())).toBe(4);
  });

  it("should select location by index correctly", ({ store }) => {
    // Add locations
    store.dispatch({
      type: "map/fetchLocations/fulfilled",
      payload: mockLocations,
      meta: { arg: undefined, requestId: "test", requestStatus: "fulfilled" },
    });

    expect(selectLocation(0)(store.getState())).toEqual([
      0.1276,
      51.5074,
      "marker1",
    ]);
    expect(selectLocation(1)(store.getState())).toEqual([
      -0.1181,
      51.5099,
      "marker2",
    ]);
    expect(selectLocation(2)(store.getState())).toEqual([
      2.3522,
      48.8566,
      "marker3",
    ]);
    expect(selectLocation(3)(store.getState())).toEqual([
      -74.006,
      40.7128,
      "marker4",
    ]);
  });

  it("should return null for invalid index", ({ store }) => {
    // Add locations
    store.dispatch({
      type: "map/fetchLocations/fulfilled",
      payload: mockLocations,
      meta: { arg: undefined, requestId: "test", requestStatus: "fulfilled" },
    });

    expect(selectLocation(10)(store.getState())).toBeUndefined();
    expect(selectLocation(-1)(store.getState())).toBeUndefined();
  });

  it("should select features correctly", ({ store }) => {
    // Add locations
    store.dispatch({
      type: "map/fetchLocations/fulfilled",
      payload: mockLocations,
      meta: { arg: undefined, requestId: "test", requestStatus: "fulfilled" },
    });

    const features = selectFeatures(store.getState());
    expect(features).toHaveLength(4);
    expect(features[0]).toEqual({
      type: "Feature",
      geometry: { type: "Point", coordinates: [0.1276, 51.5074] },
      properties: { ix: 0, custom_marker_id: "marker1" },
    });
    expect(features[1]).toEqual({
      type: "Feature",
      geometry: { type: "Point", coordinates: [-0.1181, 51.5099] },
      properties: { ix: 1, custom_marker_id: "marker2" },
    });
  });

  it("should select features with specific indexes", ({ store }) => {
    // Add locations
    store.dispatch({
      type: "map/fetchLocations/fulfilled",
      payload: mockLocations,
      meta: { arg: undefined, requestId: "test", requestStatus: "fulfilled" },
    });

    const features = selectFeatures(store.getState(), [0, 2]);
    expect(features).toHaveLength(2);
    expect(features[0]).toEqual({
      type: "Feature",
      geometry: { type: "Point", coordinates: [0.1276, 51.5074] },
      properties: { ix: 0, custom_marker_id: "marker1" },
    });
    expect(features[1]).toEqual({
      type: "Feature",
      geometry: { type: "Point", coordinates: [2.3522, 48.8566] },
      properties: { ix: 2, custom_marker_id: "marker3" },
    });
  });

  it("should handle empty locations array", ({ store }) => {
    expect(selectTotalItemsCount(store.getState())).toBe(0);
    expect(selectLocation(0)(store.getState())).toBeUndefined();
    expect(selectFeatures(store.getState())).toEqual([]);
  });

  it("should handle locations with missing data", ({ store }) => {
    const incompleteLocations = [
      [0.1276, 51.5074, "marker1"],
      [2.3522, 48.8566], // Missing marker ID
      [-74.006, 40.7128, "marker4"],
    ];

    store.dispatch({
      type: "map/fetchLocations/fulfilled",
      payload: incompleteLocations,
      meta: { arg: undefined, requestId: "test", requestStatus: "fulfilled" },
    });

    expect(selectTotalItemsCount(store.getState())).toBe(3);
    expect(selectLocation(1)(store.getState())).toEqual([2.3522, 48.8566]);

    const features = selectFeatures(store.getState());
    expect(features).toHaveLength(3);
    expect(features[1]).toEqual({
      type: "Feature",
      geometry: { type: "Point", coordinates: [2.3522, 48.8566] },
      properties: { ix: 1, custom_marker_id: undefined },
    });
  });
});
