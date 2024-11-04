import { createSelector } from "@reduxjs/toolkit";
import { createAppSlice } from "../../../app/createAppSlice";
import { selectFilterOptions } from "../searchPanel/searchSlice";
import { configLoaded } from "../../../app/vocabsSlice";

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
      const config = action.payload;
      state.fieldId = config.ui.directory_panel_field;
    });
  },
  selectors: {},
});

export const {} = directorySlice.actions;

export const {} = directorySlice.selectors;

export const selectDirectoryOptions = createSelector(
  [selectFilterOptions, (state): string => state.directory.fieldId],
  (
    filterOptions,
    fieldId,
  ): {
    id: string;
    options: { value: string; label: string }[];
    value: string;
  } => filterOptions.find((filter) => filter.id === fieldId)!!,
);
