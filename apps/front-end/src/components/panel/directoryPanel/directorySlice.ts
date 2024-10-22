import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../../app/createAppSlice";
import { configLoaded } from "../searchPanel/searchSlice";

interface DirectoryState {
  fieldId: string;
  fieldOptions: string[];
  panelLoaded: boolean;
}

const initialState: DirectoryState = {
  fieldId: "",
  fieldOptions: [],
  panelLoaded: false,
};

export const directorySlice = createAppSlice({
  name: "directory",
  initialState,
  reducers: (create) => ({}),
  extraReducers: (builder) => {
    builder.addCase(configLoaded, (state, action) => {
      // TODO: get directory_panel_field from config and its associated vocab
    });
  },
  selectors: {},
});

export const {} = directorySlice.actions;

export const {} = directorySlice.selectors;
