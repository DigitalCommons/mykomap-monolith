import { createAppSlice } from "../../app/createAppSlice";

interface PopUpState {
  isOpen: boolean;
}

const initialState: PopUpState = {
  isOpen: false,
};

export const popUpSlice = createAppSlice({
  name: "popUp",
  initialState,
  reducers: (create) => ({
    togglePopUp: create.reducer((state) => {
      state.isOpen = !state.isOpen;
    }),
    closePopUp: create.reducer((state) => {
      state.isOpen = false;
    }),
  }),
  selectors: {
    popUpIsOpen: (popUp) => popUp.isOpen,
  },
});

export const { togglePopUp, closePopUp } = popUpSlice.actions;
export const { popUpIsOpen } = popUpSlice.selectors;
