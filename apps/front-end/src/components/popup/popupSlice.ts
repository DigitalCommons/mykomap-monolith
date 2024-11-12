import { createAppSlice } from "../../app/createAppSlice";

interface PopupState {
  isOpen: boolean;
}

const initialState: PopupState = {
  isOpen: false,
};

export const popupSlice = createAppSlice({
  name: "popup",
  initialState,
  reducers: (create) => ({
    togglePopup: create.reducer((state) => {
      state.isOpen = !state.isOpen;
    }),
    openPopup: create.reducer((state) => {
      state.isOpen = true;
    }),
    closePopup: create.reducer((state) => {
      state.isOpen = false;
    }),
  }),
  selectors: {
    popupIsOpen: (popup) => popup.isOpen,
  },
});

export const { togglePopup, openPopup, closePopup } = popupSlice.actions;
export const { popupIsOpen } = popupSlice.selectors;
