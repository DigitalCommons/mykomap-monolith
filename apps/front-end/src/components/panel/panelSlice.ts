import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice";

interface PanelState {
  selectedTab: number;
  panelVisible: boolean;
  isOpen: boolean;
}

const initialState: PanelState = {
  selectedTab: 0,
  panelVisible: false,
  isOpen: false,
};

export const panelSlice = createAppSlice({
  name: "panel",
  initialState,
  reducers: (create) => ({
    setSelectedTab: create.reducer((state, action: PayloadAction<number>) => {
      state.selectedTab = action.payload;
    }),
    setPanelVisible: create.reducer((state, action: PayloadAction<boolean>) => {
      state.panelVisible = action.payload;
    }),
    togglePanel: create.reducer((state) => {
      state.isOpen = !state.isOpen;
    }),
    closePanel: create.reducer((state) => {
      state.isOpen = false;
      state.panelVisible = false;
    }),
  }),
  selectors: {
    selectSelectedTab: (panel) => panel.selectedTab,
    selectPanelVisible: (panel) => panel.panelVisible,
    selectIsOpen: (panel) => panel.isOpen,
  },
});

export const { setSelectedTab, setPanelVisible, togglePanel, closePanel } =
  panelSlice.actions;

export const { selectSelectedTab, selectPanelVisible, selectIsOpen } =
  panelSlice.selectors;
