import { createAction, PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "./createAppSlice";
import { Config, getConfig } from "../services";
import { getUrlSearchParam } from "../utils/window-utils";

export interface ConfigSliceState {
  vocabs: Config["vocabs"];
  languages: string[];
  currentLanguage: string;
}

const initialState: ConfigSliceState = {
  vocabs: {},
  currentLanguage: "en",
  languages: [],
};

export const configSlice = createAppSlice({
  name: "config",
  initialState,
  reducers: (create) => ({
    fetchConfig: create.asyncThunk(
      async (_, thunkApi) => {
        const datasetId = getUrlSearchParam("datasetId");
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
  selectors: {},
});

export const configLoaded = createAction<Config>("configLoaded");

export const { fetchConfig, setLanguage } = configSlice.actions;
