import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import LeftPane from "./leftPane/LeftPane";
import RightPane from "./rightPane/RightPane";
import CloseButton from "../common/closeButton/CloseButton";
import { styled } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closePopup, selectPopupIsOpen, selectPopupData } from "./popupSlice";
import { POPUP_CONTAINER_ID } from "../map/mapLibre";

const StyledPopup = styled(Box)(({ theme }) => ({
  width: "calc (100% - (var(--spacing-large) * 2))",
  height: "calc(100% - (var(--spacing-large) * 2 + 80px))",
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  padding: 0,
  borderRadius: "var(--border-radius-xlarge)",
  margin: "auto var(--spacing-large)",
  outline: "none",
  position: "relative",
  textAlign: "left",
  "@media (min-width: 768px)": {
    width: "100%",
    height: "auto",
    maxWidth: 700,
    maxHeight: 450,
    margin: "auto",
  },
}));

const StylePopupInner = styled(Box)(() => ({
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

const StyledPointer = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: -17,
  left: "50%",
  transform: "translateX(-50%)",
  width: 0,
  borderLeft: "17px solid transparent",
  borderRight: "17px solid transparent",
  borderTop: `20px solid ${theme.palette.background.paper}`,
}));

const Popup = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectPopupIsOpen);
  const data = useAppSelector(selectPopupData);

  const handleClosePopup = () => {
    dispatch(closePopup());
  };

  return (
    open &&
    document.getElementById(POPUP_CONTAINER_ID) &&
    createPortal(
      // <Modal
      //   open={open}
      //   onClose={handleClosePopup}
      //   aria-labelledby={`pop-up-${mockItem.id}`}
      //   aria-describedby="pop-up-description"
      //   closeAfterTransition
      // >
      //   <Fade in={open}>
      <StyledPopup>
        {/* <CloseButton
          sx={{
            position: "absolute",
            right: "14px",
            top: "14px",
          }}
          buttonAction={handleClosePopup}
        /> */}
        <StylePopupInner>
          <LeftPane {...data} />
          <RightPane {...data} />
        </StylePopupInner>
        {/* <StyledPointer /> */}
      </StyledPopup>,
      //   </Fade>
      // </Modal>
      document.getElementById(POPUP_CONTAINER_ID)!!,
    )
  );
};

export default Popup;
