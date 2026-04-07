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
  markerIcons?: NonNullable<Config["ui"]["customMarkers"]>["markerIcons"];
  markerPropertyName?: NonNullable<
    Config["ui"]["customMarkers"]
  >["marker_property_name"];
  markerVocabId?: string;
  markerTermsToIconIndex?: NonNullable<
    Config["ui"]["customMarkers"]
  >["termsToIconIndex"];
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

/**
 * Derives the marker vocabulary ID from the config.
 * @param config The configuration object.
 * @returns The marker vocabulary ID or undefined if not found.
 */

const deriveMarkerVocabId = (config: Config): string | undefined => {
  const markerPropertyName = config.ui.customMarkers?.marker_property_name;
  if (!markerPropertyName) return undefined;

  return (
    (config.itemProps[markerPropertyName] as { uri?: string } | undefined)?.uri?.replace(
      ":",
      "",
    )
  );
};

/**
 * Derives a mapping of primary marker labels by their icon index. It looks up the terms
 * associated with markers in the config, finds the corresponding labels for those terms
 * in the current language, and returns an object mapping icon indices to labels. This is
 * used to display the correct labels in the map key.
 * @param state The config slice state.
 * @returns An object mapping marker icon indices to their primary labels.
 */

const derivePrimaryMarkerLabelsByIconIndex = (
  state: ConfigSliceState,
): Record<number, string> => {
  const vocab = state.markerVocabId ? state.vocabs?.[state.markerVocabId] : undefined;
  const termsInCurrentLanguage =
    vocab?.[state.currentLanguage]?.terms ?? Object.values(vocab ?? {})[0]?.terms;

  const primaryTerms = Object.entries(state.markerTermsToIconIndex ?? {}).filter(
    ([term]) => term !== "default" && !term.includes("-"),
  );

  return primaryTerms.reduce(
    (acc, [term, iconIndex]) => {
      const label = termsInCurrentLanguage?.[term];
      if (label && acc[iconIndex] === undefined) {
        acc[iconIndex] = label;
      }
      return acc;
    },
    {} as Record<number, string>,
  );
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
  dataSources: undefined,
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
      state.markerIcons = action.payload.ui.customMarkers?.markerIcons;
      state.markerPropertyName =
        action.payload.ui.customMarkers?.marker_property_name;
      state.markerVocabId = deriveMarkerVocabId(action.payload);
      state.markerTermsToIconIndex =
        action.payload.ui.customMarkers?.termsToIconIndex;

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
    selectPrimaryMarkerLabelsByIconIndex: (state) =>
      derivePrimaryMarkerLabelsByIconIndex(state),
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
  selectPrimaryMarkerLabelsByIconIndex,
  selectConfigStatus,
  selectDataSources,
} = configSlice.selectors;
