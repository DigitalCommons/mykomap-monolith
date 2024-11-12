import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import LeftPane from "./leftPane/LeftPane";
import RightPane from "./rightPane/RightPane";
import CloseButton from "../common/closeButton/CloseButton";
import { styled } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closePopup, popupIsOpen } from "./popupSlice";
import mockItem from "../../data/mockItem";
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
  "@media (min-width: 768px)": {
    width: "100%",
    height: "auto",
    maxWidth: 900,
    maxHeight: 600,
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
  const open = useAppSelector(popupIsOpen);

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
      <StyledPopup id="'aaaaaaaaaa">
        {/* <CloseButton
          sx={{
            position: "absolute",
            right: "14px",
            top: "14px",
          }}
          buttonAction={handleClosePopup}
        /> */}
        <StylePopupInner>
          <LeftPane
            name={mockItem.name}
            primaryActivity={mockItem.primary_activity}
            description={mockItem.description}
            dcDomains={mockItem.dc_domains}
          />
          <RightPane
            geocodedAddr={mockItem.geocoded_addr}
            website={mockItem.website}
            organisationalStructure={mockItem.organisational_structure}
            typology={mockItem.typology}
            dataSources={mockItem.data_sources}
          />
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
