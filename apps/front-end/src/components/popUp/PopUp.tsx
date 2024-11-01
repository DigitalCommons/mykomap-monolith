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
  display: "flex",
  flexDirection: "row",
  backgroundColor: theme.palette.background.paper,
  padding: 0,
  borderRadius: "var(--border-radius-xlarge)",
  maxWidth: 900,
  maxHeight: 600,
  margin: "auto",
  outline: "none",
  position: "relative",
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
          <StyledPointer />
        </StyledPopUp>
      </Fade>
    </Modal>
  );
};

export default PopUp;
