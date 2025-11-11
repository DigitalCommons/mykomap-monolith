import type { AppStore } from "../../../app/store";
import { makeStore } from "../../../app/store";
import { directorySlice, selectDirectoryOptions } from "./directorySlice";
import { configLoaded, setLanguage } from "../../../app/configSlice";
import mockConfig from "../../../mockData/mockConfig";

interface LocalTestContext {
  store: AppStore;
}

describe<LocalTestContext>("directory reducer", (it) => {
  beforeEach<LocalTestContext>((context) => {
    const store = makeStore();
    context.store = store;
  });

  it("should handle configLoaded action", ({ store }) => {
    expect(store.getState().directory.propId).toBe("");

    store.dispatch(configLoaded(mockConfig));

    expect(store.getState().directory.propId).toBe("country_id");
  });

  it("should select directory options correctly sorted", ({ store }) => {
    store.dispatch(configLoaded(mockConfig));

    const directoryOptions = selectDirectoryOptions(store.getState());

    expect(directoryOptions).toEqual({
      id: "country_id",
      title: "Country",
      options: [
        { value: "any", label: "- any -" },
        { value: "FR", label: "France" },
        { value: "GB", label: "United Kingdom" },
      ],
      value: "any",
    });
  });

  it("should handle different directory panel field", ({ store }) => {
    const configWithDifferentField = {
      ...mockConfig,
      ui: {
        ...mockConfig.ui,
        directory_panel_field: "primary_activity",
      },
    };

    store.dispatch(configLoaded(configWithDifferentField));

    const directoryOptions = selectDirectoryOptions(store.getState());

    expect(directoryOptions).toEqual({
      id: "primary_activity",
      title: "Primary Activity",
      options: [
        { value: "any", label: "- any -" },
        { value: "ICA210", label: "Housing" },
        { value: "ICA220", label: "Transport" },
        { value: "ICA230", label: "Utilities" },
      ],
      value: "any",
    });
  });

  it("should handle language change", ({ store }) => {
    // First dispatch configLoaded to set the propId
    store.dispatch(configLoaded(mockConfig));

    // Change language to French
    store.dispatch(setLanguage("fr"));

    const directoryOptions = selectDirectoryOptions(store.getState());

    expect(directoryOptions).toEqual({
      id: "country_id",
      title: "Pays",
      options: [
        { value: "any", label: "- any -" },
        { value: "FR", label: "France" },
        { value: "GB", label: "Royaume-Uni" },
      ],
      value: "any",
    });
  });

  it("should handle multiple config loads", ({ store }) => {
    expect(store.getState().directory.propId).toBe("");

    // First config load
    store.dispatch(configLoaded(mockConfig));
    expect(store.getState().directory.propId).toBe("country_id");

    // Second config load with different field
    const secondConfig = {
      ...mockConfig,
      ui: {
        ...mockConfig.ui,
        directory_panel_field: "primary_activity",
      },
    };
    store.dispatch(configLoaded(secondConfig));
    expect(store.getState().directory.propId).toBe("primary_activity");
  });
});
