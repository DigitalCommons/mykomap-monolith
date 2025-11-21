import type { AppStore } from "../../app/store";
import { makeStore } from "../../app/store";
import {
  openPopup,
  closePopup,
  selectPopupIsOpen,
  selectPopupIndex,
  selectPopupData,
} from "./popupSlice";
import { configLoaded, setLanguage } from "../../app/configSlice";
import mockConfig from "../../mockData/mockConfig";
import mockItem from "../../mockData/mockItem";
import * as services from "../../services";
import * as windowUtils from "../../utils/window-utils";

const mockItemWithIndexZero = {
  ...mockItem,
  index: "@0",
};

interface LocalTestContext {
  store: AppStore;
}

describe<LocalTestContext>("popup reducer", (it) => {
  beforeEach<LocalTestContext>((context) => {
    // Set up mocks
    vi.spyOn(services, "getDatasetItem").mockResolvedValue({
      status: 200,
      body: mockItemWithIndexZero,
      headers: new Headers(),
    });
    vi.spyOn(windowUtils, "getDatasetId").mockReturnValue("test-dataset");

    const store = makeStore();
    context.store = store;
  });

  it("should handle openPopup andclosePopup", async ({ store }) => {
    await store.dispatch(openPopup(0));

    expect(selectPopupIsOpen(store.getState())).toBe(true);
    expect(selectPopupIndex(store.getState())).toBe(0);

    store.dispatch(closePopup());

    expect(selectPopupIsOpen(store.getState())).toBe(false);
  });

  it("should handle openPopup pending", ({ store }) => {
    expect(store.getState().popup.status).toBe("loading");

    store.dispatch({
      type: "popup/openPopup/pending",
      meta: { arg: 5, requestId: "test", requestStatus: "pending" },
    });

    expect(store.getState().popup.status).toBe("loading");
    // The pending action doesn't yet update the index, so it should remain -1
    expect(selectPopupIndex(store.getState())).toBe(-1);
  });

  it("should handle openPopup fulfilled", ({ store }) => {
    expect(store.getState().popup.status).toBe("loading");
    expect(selectPopupIsOpen(store.getState())).toBe(false);

    store.dispatch({
      type: "popup/openPopup/fulfilled",
      payload: mockItemWithIndexZero,
      meta: { arg: 3, requestId: "test", requestStatus: "fulfilled" },
    });

    expect(store.getState().popup.status).toBe("loaded");
    expect(selectPopupIsOpen(store.getState())).toBe(true);
    expect(selectPopupIndex(store.getState())).toBe(3);
    expect(store.getState().popup.data).toEqual(mockItem);
  });

  it("should handle openPopup rejected", ({ store }) => {
    expect(store.getState().popup.status).toBe("loading");

    store.dispatch({
      type: "popup/openPopup/rejected",
      payload: "Failed to fetch popup data",
      meta: { arg: 2, requestId: "test", requestStatus: "rejected" },
    });

    expect(store.getState().popup.status).toBe("failed");
  });

  it("should handle configLoaded action", ({ store }) => {
    expect(store.getState().popup.itemProps).toEqual({});

    store.dispatch(configLoaded(mockConfig));

    expect(store.getState().popup.itemProps).toEqual(mockConfig.itemProps);
  });

  it("should handle popup with different data", ({ store }) => {
    const differentData = {
      ...mockItem,
      id: "test/cuk/R000003",
      name: "Another Cooperative Organization",
      primary_activity: "aci:ICA220",
    };

    store.dispatch({
      type: "popup/openPopup/fulfilled",
      payload: { ...differentData, index: "@7" },
      meta: { arg: 7, requestId: "test", requestStatus: "fulfilled" },
    });

    expect(selectPopupIsOpen(store.getState())).toBe(true);
    expect(selectPopupIndex(store.getState())).toBe(7);
    expect(store.getState().popup.data).toEqual(differentData);
  });

  it("should handle popup with empty data", ({ store }) => {
    const emptyData = {};

    store.dispatch({
      type: "popup/openPopup/fulfilled",
      payload: { ...emptyData, index: "@0" },
      meta: { arg: 0, requestId: "test", requestStatus: "fulfilled" },
    });

    expect(selectPopupIsOpen(store.getState())).toBe(true);
    expect(selectPopupIndex(store.getState())).toBe(0);
    expect(store.getState().popup.data).toEqual(emptyData);
  });

  it("should select popup data in English", ({ store }) => {
    // First load config to populate itemProps and vocabs, and set language
    store.dispatch(configLoaded(mockConfig));
    store.dispatch(setLanguage("en"));

    // Open popup with mockItem data
    store.dispatch({
      type: "popup/openPopup/fulfilled",
      payload: mockItemWithIndexZero,
      meta: { arg: 0, requestId: "test", requestStatus: "fulfilled" },
    });

    // Select popup data - should return translated/processed data
    const popupData = selectPopupData(store.getState());

    expect(popupData).toEqual({
      address:
        "123 Western Road, Brighton, East Sussex, BN1 2AB, United Kingdom",
      country_id: "United Kingdom",
      data_sources: ["International Cooperative Alliance", "DotCoop"],
      dc_domains: [
        "brightonhousing.coop",
        "bchc.coop",
        "brightoncoop.coop",
        "communityhousing.coop",
        "sustainablehomes.coop",
        "ecoapartments.coop",
        "victorianrenovations.coop",
        "brightoncommunity.coop",
        "affordablehousing.coop",
        "localhomes.coop",
        "communityliving.coop",
        "sustainableliving.coop",
        "brightonproperties.coop",
        "cooperativehomes.coop",
        "memberowned.coop",
        "democratichousing.coop",
        "communityfocused.coop",
        "localhousing.coop",
        "sustainablecommunity.coop",
        "brightonhomes.coop",
      ],
      description:
        "Brighton Community Housing Cooperative is a member-owned housing cooperative dedicated to providing affordable, sustainable housing solutions in the Brighton area. Founded in 1995, we manage over 200 properties across the city, offering secure tenancies and community-focused living spaces.",
      geocontainer_lat: 50.85045216,
      geocontainer_lon: -0.92472819,
      id: "test/cuk/R000002",
      latitude: 50.850452,
      longitude: -0.924728,
      name: "Brighton Community Housing Cooperative",
      organisational_structure: "Producer cooperative",
      primary_activity: "Housing",
      typology: "Workers",
      website: ["https://www.brightonhousing.coop"],
    });
  });

  it("should select popup data in French", ({ store }) => {
    // First load config to populate itemProps and vocabs, and set language
    store.dispatch(configLoaded(mockConfig));
    store.dispatch(setLanguage("fr"));

    // Open popup with mockItem data
    store.dispatch({
      type: "popup/openPopup/fulfilled",
      payload: mockItemWithIndexZero,
      meta: { arg: 0, requestId: "test", requestStatus: "fulfilled" },
    });

    // Select popup data - should return French translations
    const popupData = selectPopupData(store.getState());

    expect(popupData).toEqual({
      address:
        "123 Western Road, Brighton, East Sussex, BN1 2AB, United Kingdom",
      country_id: "Royaume-Uni",
      data_sources: ["Alliance coopérative internationale", "DotCoop"],
      dc_domains: [
        "brightonhousing.coop",
        "bchc.coop",
        "brightoncoop.coop",
        "communityhousing.coop",
        "sustainablehomes.coop",
        "ecoapartments.coop",
        "victorianrenovations.coop",
        "brightoncommunity.coop",
        "affordablehousing.coop",
        "localhomes.coop",
        "communityliving.coop",
        "sustainableliving.coop",
        "brightonproperties.coop",
        "cooperativehomes.coop",
        "memberowned.coop",
        "democratichousing.coop",
        "communityfocused.coop",
        "localhousing.coop",
        "sustainablecommunity.coop",
        "brightonhomes.coop",
      ],
      description:
        "Brighton Community Housing Cooperative is a member-owned housing cooperative dedicated to providing affordable, sustainable housing solutions in the Brighton area. Founded in 1995, we manage over 200 properties across the city, offering secure tenancies and community-focused living spaces.",
      geocontainer_lat: 50.85045216,
      geocontainer_lon: -0.92472819,
      id: "test/cuk/R000002",
      latitude: 50.850452,
      longitude: -0.924728,
      name: "Brighton Community Housing Cooperative",
      organisational_structure: "Coopératives de producteurs",
      primary_activity: "Logement",
      typology: "Travailleurs",
      website: ["https://www.brightonhousing.coop"],
    });
  });
});
