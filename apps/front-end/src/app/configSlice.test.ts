import type { AppStore } from "./store";
import { makeStore } from "./store";
import {
  setLanguage,
  selectCurrentLanguage,
  selectLogo,
  selectMapConfig,
  selectConfigStatus,
  selectSubmap,
  configLoaded,
  fetchConfig,
} from "./configSlice";
import * as services from "../services";
import * as windowUtils from "../utils/window-utils";

interface LocalTestContext {
  store: AppStore;
}

import mockConfig from "../mockApiResponses/mockConfig";

describe<LocalTestContext>("config reducer", (it) => {
  beforeEach<LocalTestContext>((context) => {
    const store = makeStore();
    context.store = store;
  });

  it("should handle setLanguage", ({ store }) => {
    // First load config with default language as english
    store.dispatch(configLoaded(mockConfig));

    expect(selectCurrentLanguage(store.getState())).toBe("en");

    store.dispatch(setLanguage("fr"));

    expect(selectCurrentLanguage(store.getState())).toBe("fr");
  });

  it("should not set invalid language", ({ store }) => {
    // First load config with default language as english
    store.dispatch(configLoaded(mockConfig));

    expect(selectCurrentLanguage(store.getState())).toBe("en");

    store.dispatch(setLanguage("invalid"));

    expect(selectCurrentLanguage(store.getState())).toBe("en");
  });

  it("should handle fetchConfig action", async ({ store }) => {
    // Set up mocks for API call
    vi.spyOn(services, "getConfig").mockResolvedValue({
      status: 200,
      body: mockConfig,
      headers: new Headers(),
    });
    vi.spyOn(windowUtils, "getDatasetId").mockReturnValue("test-dataset");

    const initialState = store.getState();
    expect(initialState.config.status).toBe("idle");
    expect(initialState.config.vocabs).toEqual({});
    expect(initialState.config.languages).toEqual([]);

    await store.dispatch(fetchConfig());

    const state = store.getState();
    expect(state.config.status).toBe("loaded");
    expect(state.config.vocabs).toEqual(mockConfig.vocabs);
    expect(state.config.languages).toEqual(mockConfig.languages);
    expect(state.config.currentLanguage).toBe("en");
    expect(state.config.map).toEqual(mockConfig.ui.map);
    expect(state.config.logo).toEqual(mockConfig.ui.logo);
  });

  it("should handle fetchConfig rejected", ({ store }) => {
    expect(selectConfigStatus(store.getState())).toBe("idle");

    store.dispatch({
      type: "config/fetchConfig/rejected",
      payload: "Failed to fetch config",
      meta: { arg: undefined, requestId: "test", requestStatus: "rejected" },
    });

    expect(selectConfigStatus(store.getState())).toBe("failed");
  });

  it("should select logo correctly", ({ store }) => {
    const logo = selectLogo(store.getState());
    expect(logo).toEqual({
      largeLogo: undefined,
      smallLogo: undefined,
      altText: undefined,
    });

    // Update logo
    store.dispatch(configLoaded(mockConfig));

    const updatedLogo = selectLogo(store.getState());
    expect(updatedLogo).toEqual(mockConfig.ui.logo);
  });

  it("should select map config correctly", ({ store }) => {
    const mapConfig = selectMapConfig(store.getState());
    expect(mapConfig).toEqual({
      mapBounds: [
        [-169, -49.3],
        [189, 75.6],
      ],
    });

    store.dispatch(configLoaded(mockConfig));

    const updatedMapConfig = selectMapConfig(store.getState());
    expect(updatedMapConfig).toEqual(mockConfig.ui.map);
  });

  it("should handle config without map bounds", ({ store }) => {
    const configWithoutMap = {
      ...mockConfig,
      ui: {
        ...mockConfig.ui,
        map: {},
      },
    };

    store.dispatch(configLoaded(configWithoutMap));

    const mapConfig = selectMapConfig(store.getState());
    expect(mapConfig).toEqual({
      mapBounds: undefined,
    });
  });

  it("should handle config without logo", ({ store }) => {
    const configWithoutLogo = {
      ...mockConfig,
      ui: {
        ...mockConfig.ui,
        logo: undefined,
      },
    };

    store.dispatch(configLoaded(configWithoutLogo));

    const logo = selectLogo(store.getState());
    expect(logo).toEqual(undefined);
  });
});

// Mock up a submap
describe<LocalTestContext>("submaps", (it) => {
  const submapConfig = {
    ...mockConfig,
    submaps: {
      "test-submap": {
        lockedFilter: ["data_sources:DC"],
        mapBounds: [
          [-97.5, 43.2],
          [-89.0, 49.5],
        ] as [[number, number], [number, number]],
        title: "Test Submap",
      },
    },
  };

  beforeEach<LocalTestContext>((context) => {
    context.store = makeStore();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should find the selected submap and override the map bounds", ({ store }) => {
    vi.spyOn(windowUtils, "getSubmapId").mockReturnValue("test-submap");

    store.dispatch(configLoaded(submapConfig));

    expect(selectSubmap(store.getState())).toMatchObject({
      id: "test-submap",
      lockedFilter: ["data_sources:DC"],
      title: "Test Submap",
    });
    expect(selectMapConfig(store.getState())?.mapBounds).toEqual([
      [-97.5, 43.2],
      [-89.0, 49.5],
    ]);
  });

  it("should ignore an unknown submap param", ({ store }) => {
    vi.spyOn(windowUtils, "getSubmapId").mockReturnValue("no-such-submap");

    store.dispatch(configLoaded(submapConfig));

    expect(selectSubmap(store.getState())).toBeUndefined();
    expect(selectMapConfig(store.getState())?.mapBounds).toEqual(
      mockConfig.ui.map?.mapBounds,
    );
  });
});
