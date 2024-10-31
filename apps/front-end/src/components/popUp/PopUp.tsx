import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import LeftPane from "./leftPane/LeftPane";
import RightPane from "./rightPane/RightPane";
import { styled } from "@mui/material/styles";

// Mock data
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

interface PopUpProps {
  open: boolean;
  onClose: () => void;
}

const StyledPopUp = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  backgroundColor: theme.palette.background.paper, // use theme value for background color
  boxModel: "border-box",
  padding: 0, // convert spacing units
  borderRadius: "var(--border-radius-xlarge)", // use theme's border radius value
  maxWidth: 900,
  margin: "auto",
  outline: "none", // remove focus outline inside modal
}));

const PopUp = ({ open, onClose }: PopUpProps) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby={`pop-up-${initiative.uid}`}
      aria-describedby="pop-up-description"
      closeAfterTransition
    >
      <Fade in={open}>
        <StyledPopUp>
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
        </StyledPopUp>
      </Fade>
    </Modal>
  );
};

export default PopUp;
