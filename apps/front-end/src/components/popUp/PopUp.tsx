import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import LeftPane from "./leftPane/LeftPane";
import RightPane from "./rightPane/RightPane";
import CloseButton from "../common/closeButton/CloseButton";
import { styled } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { closePopUp, popUpIsOpen } from "./popUpSlice";

const initiative = {
  uid: "test/cuk/R000002",
  name: "Pears United",
  description: "We sell pears",
  website: "https://pears.coop",
  dc_domains: ["pears.coop", "pearsunited.coop"],
  country_id: "coun:FR",
  primary_activity: "aci:ICA230",
  organisational_structure: "os:OS90",
  typology: "bmt:BMT30",
  latitude: 50.850452,
  longitude: 0.924728,
  geocontainer_lat: 50.85045216,
  geocontainer_lon: 0.92472819,
  geocoded_addr: "79 rue de la Mare aux Carats, 34090 Montpellier, France",
  data_sources: ["dso:DC"],
};

const StyledPopUp = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  backgroundColor: theme.palette.background.paper,
  padding: 0,
  borderRadius: "var(--border-radius-xlarge)",
  maxWidth: 900,
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
      aria-labelledby={`pop-up-${initiative.uid}`}
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
            name={initiative.name}
            primaryActivity={initiative.primary_activity}
            description={initiative.description}
            dcDomains={initiative.dc_domains}
          />
          <RightPane
            geocodedAddr={initiative.geocoded_addr}
            website={initiative.website}
            organisationalStructure={initiative.organisational_structure}
            typology={initiative.typology}
            dataSources={initiative.data_sources}
          />
          <StyledPointer />
        </StyledPopUp>
      </Fade>
    </Modal>
  );
};

export default PopUp;
