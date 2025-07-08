import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "./createAppSlice";
import { Config, getConfig } from "../services";
import { getDatasetId } from "../utils/window-utils";
import i18n from "../i18n";

export type ConfigMap = {
  // defaultZoom?: number;
  // defaultCenter?: [number, number];
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

export interface ConfigSliceState {
  vocabs: Config["vocabs"];
  languages: string[];
  currentLanguage: string;
  map?: ConfigMap;
  logo?: ConfigLogo;
  status: "idle" | "loading" | "loaded" | "failed";
}

const initialState: ConfigSliceState = {
  vocabs: {},
  currentLanguage: "en",
  languages: [],
  map: {
    // defaultZoom: undefined,
    // defaultCenter: undefined,
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
              // defaultZoom: uiMap.defaultZoom,
              // defaultCenter: uiMap.defaultCenter,
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
        },
        rejected: (state, action) => {
          console.error("Error fetching config", action.payload);
        },
      },
    ),
    setLanguage: create.reducer((state, action: PayloadAction<string>) => {
      if (state.languages.includes(action.payload))
        state.currentLanguage = action.payload;
    }),
  }),
  selectors: {
    selectCurrentLanguage: (state) => state.currentLanguage,
    selectLogo: (state) => state.logo,
    selectMapConfig: (state) => state.map,
    selectConfigStatus: (state) => state.status,
  },
});

export const configLoaded = createAction<Config>("configLoaded");

export const { fetchConfig, setLanguage } = configSlice.actions;

export const { selectCurrentLanguage, selectLogo, selectMapConfig, selectConfigStatus } =
  configSlice.selectors;
