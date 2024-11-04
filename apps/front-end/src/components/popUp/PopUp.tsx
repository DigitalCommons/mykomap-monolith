import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import LeftPane from "./leftPane/LeftPane";
import RightPane from "./rightPane/RightPane";
import CloseButton from "../common/closeButton/CloseButton";
import { styled } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closePopUp, popUpIsOpen } from "./popUpSlice";
import mockInitiative from "../../data/mockInitiative";

const StyledPopUp = styled(Box)(({ theme }) => ({
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

const StylePopUpInner = styled(Box)(() => ({
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

const PopUp = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector(popUpIsOpen);

  const handleClosePopUp = () => {
    dispatch(closePopUp());
  };

  return (
    <Modal
      open={open}
      onClose={handleClosePopUp}
      aria-labelledby={`pop-up-${mockInitiative.uid}`}
      aria-describedby="pop-up-description"
      closeAfterTransition
    >
      <Fade in={open}>
        <StyledPopUp>
          <CloseButton
            sx={{
              position: "absolute",
              right: "14px",
              top: "14px",
            }}
            buttonAction={handleClosePopUp}
          />
          <StylePopUpInner>
            <LeftPane
              name={mockInitiative.name}
              primaryActivity={mockInitiative.primary_activity}
              description={mockInitiative.description}
              dcDomains={mockInitiative.dc_domains}
            />
            <RightPane
              geocodedAddr={mockInitiative.geocoded_addr}
              website={mockInitiative.website}
              organisationalStructure={mockInitiative.organisational_structure}
              typology={mockInitiative.typology}
              dataSources={mockInitiative.data_sources}
            />
          </StylePopUpInner>
          <StyledPointer />
        </StyledPopUp>
      </Fade>
    </Modal>
  );
};

export default PopUp;
