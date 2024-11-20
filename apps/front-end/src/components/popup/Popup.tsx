import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import LeftPane from "./leftPane/LeftPane";
import RightPane from "./rightPane/RightPane";
import { styled } from "@mui/material/styles";
import { useAppSelector } from "../../app/hooks";
import { selectPopupIsOpen, selectPopupData } from "./popupSlice";
import { POPUP_CONTAINER_ID } from "../map/mapLibre";

const StyledPopup = styled(Box)(({ theme }) => ({
  width: "300px",
  height: "450px",
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  padding: 0,
  borderRadius: "var(--border-radius-xlarge)",
  outline: "none",
  position: "relative",
  textAlign: "left",
  overflowY: "auto",
  "@media (min-width: 768px)": {
    width: "100%",
    height: "auto",
    minWidth: 600,
    maxWidth: 700,
    maxHeight: 450,
    margin: "auto",
    overflow: "hidden",
  },
}));

const StylePopupInner = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1)",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: "10px",
  },
  "@media (min-width: 768px)": {
    flexDirection: "row",
    width: "100%",
    overflowY: "hidden",
  },
}));

const Popup = () => {
  const open = useAppSelector(selectPopupIsOpen);
  const data = useAppSelector(selectPopupData);

  return (
    open &&
    document.getElementById(POPUP_CONTAINER_ID) &&
    createPortal(
      <StyledPopup>
        <StylePopupInner>
          <LeftPane {...data} />
          <RightPane {...data} />
        </StylePopupInner>
      </StyledPopup>,
      document.getElementById(POPUP_CONTAINER_ID)!!,
    )
  );
};

export default Popup;
