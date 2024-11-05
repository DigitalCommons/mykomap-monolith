import { createAction } from "@reduxjs/toolkit";
import { createAppSlice } from "./createAppSlice";
import mockConfig from "../data/mockConfig";
import { Config, getConfig } from "../services";

export interface VocabsSliceState {
  vocabs: Config["vocabs"];
  language: string;
}

const initialState: VocabsSliceState = {
  vocabs: {},
  language: "en",
};

export const vocabsSlice = createAppSlice({
  name: "vocabs",
  initialState,
  reducers: (create) => ({
    fetchConfig: create.asyncThunk(
      async (_, thunkApi) => {
        const datasetId =
          new URLSearchParams(window.location.search).get("datasetId") ?? "";
        if (datasetId === "") {
          return thunkApi.rejectWithValue(
            `No datasetId parameter given, so no dataset config can be retrieved`,
          );
        }

        thunkApi.dispatch(configLoaded(mockConfig));
        return mockConfig;

        // const response = await getConfig({
        //   params: { datasetId: datasetId },
        // });
        // if (response.status === 200) {
        //   thunkApi.dispatch(configLoaded(response.body));
        //   return response.body;
        // } else {
        //   return thunkApi.rejectWithValue(
        //     `Failed get config, status code ${response.status}`,
        //   );
        // }
      },
      {
        fulfilled: (state, action) => {
          console.log("Mock config", action.payload);
          state.vocabs = action.payload.vocabs;

          if (action.payload.languages.length > 0) {
            const urlParamLang = new URLSearchParams(
              window.location.search,
            ).get("lang");
            if (
              urlParamLang &&
              action.payload.languages.includes(urlParamLang.toLowerCase())
            ) {
              state.language = urlParamLang.toLowerCase();
            } else {
              state.language = action.payload.languages[0];
            }
          }
        },
        rejected: (state, action) => {
          console.error("Error fetching config", action.payload);
        },
      },
    ),
  }),
  selectors: {
    selectVocabs: (vocabs) => vocabs.vocabs,
  },
});

export const configLoaded = createAction<Config>("configLoaded");

export const { fetchConfig } = vocabsSlice.actions;

export const { selectVocabs } = vocabsSlice.selectors;
