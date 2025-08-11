import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "./createAppSlice";
import { Config, getConfig } from "../services";
import { getDatasetId } from "../utils/window-utils";
import i18n from "../i18n";
import PopupItemConfigs from "../components/popup/PopupItems";

export type ConfigMap = {
  mapBounds?: [[number, number], [number, number]];
};

export type ConfigLogo = {
  largeLogo?: string;
  smallLogo?: string;
  altText?: string;
  smallScreenPosition?: {
    top?: string;
    left?: string;
  };
  largeScreenPosition?: {
    bottom?: string;
    right?: string;
  };
};

export type PopupItemConfigNoMultiple = {
  itemProp: string;
  valueStyle: "text" | "address" | "hyperlink";
  showBullets: boolean;
  singleColumnLimit?: number;
  showLabel: boolean;
  hyperlinkBaseUri: string;
  displayText?: string;
}

export type ConfigPopupNoMultiple = {
  titleProp: string;
  leftPane: PopupItemConfigNoMultiple[];
  topRightPane: PopupItemConfigNoMultiple[];
  bottomRightPane: PopupItemConfigNoMultiple[];
};

export type PopupItemConfig = PopupItemConfigNoMultiple & {
  multiple: boolean;
};

export type ConfigPopup = {
  titleProp: string;
  leftPane: PopupItemConfig[];
  topRightPane: PopupItemConfig[];
  bottomRightPane: PopupItemConfig[];
};

export interface ConfigSliceState {
  vocabs: Config["vocabs"];
  languages: string[];
  currentLanguage: string;
  map?: ConfigMap;
  logo?: ConfigLogo;
  status: "idle" | "loading" | "loaded" | "failed";
  popup?: ConfigPopup;
}

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
  logo: {
    largeLogo: undefined,
    smallLogo: undefined,
    altText: undefined,
  },
  status: "idle",
  popup: {
    titleProp: "name",
    leftPane: [],
    topRightPane: [],
    bottomRightPane: [],
  },
};

function deriveMultiples(popupConfigRaw: ConfigPopupNoMultiple, itemProps: any) {
  const { leftPane, topRightPane, bottomRightPane } = popupConfigRaw;
  const popupConfig: ConfigPopup = {
    titleProp: popupConfigRaw.titleProp,
    leftPane: leftPane.map(itemConfig => ({ ...itemConfig, multiple: itemProps[itemConfig.itemProp].type === "multi" })),
    topRightPane: topRightPane.map(itemConfig => ({ ...itemConfig, multiple: itemProps[itemConfig.itemProp].type === "multi" })),
    bottomRightPane: bottomRightPane.map(itemConfig => ({ ...itemConfig, multiple: itemProps[itemConfig.itemProp].type === "multi" })),
  }

  return popupConfig;
}

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
          thunkApi.dispatch(configLoaded(response.body));
          i18n.loadLanguages(response.body.languages);
          return response.body;
        } else {
          return thunkApi.rejectWithValue(
            `Failed get config, status code ${response.status}`,
          );
        }
      },
      {
        fulfilled: (state, action) => {
          console.log("Config", action.payload);
          state.vocabs = action.payload.vocabs;
          state.languages = action.payload.languages;
          state.currentLanguage = action.payload.languages[0];
          state.status = "loaded";

          if (action.payload.ui && action.payload.ui.map) {
            const uiMap = action.payload.ui.map;
            state.map = {
              mapBounds:
                uiMap.mapBounds && uiMap.mapBounds.length === 2
                  ? [
                    [uiMap.mapBounds[0][0], uiMap.mapBounds[0][1]],
                    [uiMap.mapBounds[1][0], uiMap.mapBounds[1][1]],
                  ]
                  : undefined,
            };
          }

          if (action.payload.ui && action.payload.ui.logo) {
            state.logo = action.payload.ui.logo;
          }

          state.popup = deriveMultiples(action.payload.popup, action.payload.itemProps);
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
  selectors: {
    selectPopupConfig: (state) => state.popup,
    selectCurrentLanguage: (state) => state.currentLanguage,
    selectLogo: (state) => state.logo,
    selectMapConfig: (state) => state.map,
    selectConfigStatus: (state) => state.status,
  },
});

export const configLoaded = createAction<Config>("configLoaded");

export const { fetchConfig, setLanguage } = configSlice.actions;

export const {
  selectCurrentLanguage,
  selectLogo,
  selectPopupConfig,
  selectMapConfig,
  selectConfigStatus,
} = configSlice.selectors;
