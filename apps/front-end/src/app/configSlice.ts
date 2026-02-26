import { createAction, type PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "./createAppSlice";
import { getConfig } from "../services";
import { Config, ConfigPopup, ConfigPopupItemRaw } from "../services/types";
import { getDatasetId } from "../utils/window-utils";
import i18n from "../i18n";

export interface ConfigSliceState {
  vocabs: Config["vocabs"];
  languages: string[];
  currentLanguage: string;
  map?: Config["ui"]["map"];
  logo?: Config["ui"]["logo"];
  status: "idle" | "loading" | "loaded" | "failed";
  popup?: ConfigPopup;
  dataSources?: Config["itemProps"]["data_sources"];
  markerIcons?: Config["ui"]["markerIcons"];
  markerPropertyName?: Config["ui"]["marker_property_name"];
}

/**
 * When building the popup UI, we need to know whether each itemProp is of type "multi" or not.
 * This function derives that information from the itemProps config and adds a "multiple" boolean
 * to the config for each popup item, so it's ready for the PopupItems component to use.
 */
const deriveMultiples = (
  popupConfigRaw: Config["popup"],
  itemProps: Config["itemProps"],
): ConfigPopup => {
  const { leftPane, topRightPane, bottomRightPane } = popupConfigRaw;
  const processMulti = (itemConfig: ConfigPopupItemRaw) => ({
    ...itemConfig,
    multiple: itemProps[itemConfig.itemProp].type === "multi",
  });
  return {
    titleProp: popupConfigRaw.titleProp,
    leftPaneWidth: popupConfigRaw.leftPaneWidth,
    leftPane: leftPane.map(processMulti),
    topRightPane: topRightPane.map(processMulti),
    bottomRightPane: bottomRightPane.map(processMulti),
  };
};

const initialState: ConfigSliceState = {
  vocabs: {},
  currentLanguage: "en",
  languages: [],
  map: {
    mapBounds: [
      [-169, -49.3],
      [189, 75.6],
    ],
  },
  markerIcons: [],
  logo: {
    largeLogo: undefined,
    smallLogo: undefined,
    altText: undefined,
  },
  status: "idle",
  popup: {
    titleProp: "name",
    leftPaneWidth: "70%",
    leftPane: [],
    topRightPane: [],
    bottomRightPane: [],
  },
  dataSources: undefined
};

export const configSlice = createAppSlice({
  name: "config",
  initialState,
  reducers: (create) => ({
    fetchConfig: create.asyncThunk(
      async (_, thunkApi) => {
        const datasetId = getDatasetId();
        if (datasetId === null) {
          return thunkApi.rejectWithValue(
            `No datasetId parameter given, so no dataset config can be retrieved`,
          );
        }

        const response = await getConfig({
          params: { datasetId: datasetId },
        });
        if (response.status === 200) {
          console.log("Fetched config", response.body);
          thunkApi.dispatch(configLoaded(response.body));
          return response.body;
        } else {
          return thunkApi.rejectWithValue(
            `Failed get config, status code ${response.status}`,
          );
        }
      },
      {
        fulfilled: (_state, _action) => {
          // We handle the data in the extraReducers configLoaded action rather than this fulfilled
          // block, so that configLoaded can be used in UTs
        },
        rejected: (state, action) => {
          console.error("Error fetching config", action.payload);
          state.status = "failed";
        },
      },
    ),
    setLanguage: create.reducer((state, action: PayloadAction<string>) => {
      if (state.languages.includes(action.payload))
        state.currentLanguage = action.payload;
    }),
  }),
  extraReducers: (builder) => {
    builder.addCase(configLoaded, (state, action) => {
      state.vocabs = action.payload.vocabs;

      state.languages = action.payload.languages;
      state.currentLanguage = action.payload.languages[0];
      i18n.loadLanguages(action.payload.languages);

      state.map = action.payload.ui.map;
      state.markerIcons = action.payload.ui.markerIcons;

      state.logo = action.payload.ui.logo;

      state.popup = deriveMultiples(
        action.payload.popup,
        action.payload.itemProps,
      );

      state.dataSources = action.payload.itemProps.data_sources;

      state.status = "loaded";
    });
  },
  selectors: {
    selectPopupConfig: (state) => state.popup,
    selectCurrentLanguage: (state) => state.currentLanguage,
    selectLogo: (state) => state.logo,
    selectMapConfig: (state) => state.map,
    selectMarkerIcons: (state) => state.markerIcons,
    selectConfigStatus: (state) => state.status,
    selectDataSources: (state) => state.dataSources,
  },
});

export const configLoaded = createAction<Config>("configLoaded");

export const { fetchConfig, setLanguage } = configSlice.actions;

export const {
  selectCurrentLanguage,
  selectLogo,
  selectPopupConfig,
  selectMapConfig,
  selectMarkerIcons,
  selectConfigStatus,
  selectDataSources,
} = configSlice.selectors;
