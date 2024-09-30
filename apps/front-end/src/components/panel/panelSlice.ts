import type { PayloadAction } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice";
import type { AppThunk } from "../../app/store";


export const panelSlice = createAppSlice({

  name: "panel",

  initialState: {
    title: "Panel",
    content: "Panel Content",
  },

  reducers: (create) => ({
    setTitle: create.reducer((state, action: PayloadAction<string>) => {
      state.title = action.payload;
    }),
    setContent: create.reducer((state, action: PayloadAction<string>) => {
      state.content = action.payload;
    }),
  }),

  selectors: {
    selectTitle: (panel) => panel.title,
    selectContent: (panel) => panel.content,
  },
});

export const { setTitle, setContent } = panelSlice.actions;
