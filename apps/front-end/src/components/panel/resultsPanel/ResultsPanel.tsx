import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled } from "@mui/material/styles";
import PanelToggleButton from "../../common/panelToggleButton/panelToggleButton";
import CloseButton from "../../common/closeButton/CloseButton";
import StandardButton from "../../common/standardButton/StandardButton";
import Results from "./results/Results";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  selectPanelVisible,
  togglePanel,
  selectIsOpen,
  closePanel,
} from "../panelSlice";

const StyledResultsPanel = styled(Drawer)(() => ({
  width: "100%)",
  position: "relative",
  overflow: "visible",
  "& .MuiDrawer-paper": {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "var(--color-secondary)",
    visibility: "visible !important",
    overflow: "visible",
    boxShadow: "0 0 20px rgba(0, 0, 0, 0.16)",
  },
  "@media (min-width: 897px)": {
    width: "calc(var(--panel-width-desktop) + 30px)",
    "& .MuiDrawer-paper": {
      width: "var(--panel-width-desktop)",
    },
  },
}));

const StyledButtonContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "space-between",
  position: "sticky",
  padding: "var(--spacing-small)",
  backgroundColor: "var(--color-secondary-light)",
  "@media (min-width: 897px)": {
    width: "var(--panel-width-desktop)",
    justifyContent: "flex-end",
  },
}));

const ResultsPanel = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsOpen);

  const panelVisible = useAppSelector(selectPanelVisible);
  const isMedium = useMediaQuery("(min-width: 897px)");

  const handleToggle = () => {
    dispatch(togglePanel());
    console.log("isOpen", isOpen);
  };

  const handlePanelClose = () => {
    dispatch(closePanel());
    console.log("panelVisible", panelVisible);
  };
  return (
    <>
      <StyledResultsPanel open={isOpen} variant="persistent">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <StyledButtonContainer>
            <StandardButton>Clear Search</StandardButton>
            {!isMedium && <CloseButton buttonAction={handlePanelClose} />}
          </StyledButtonContainer>
          <Results />
        </Box>
        {isMedium && (
          <PanelToggleButton buttonAction={handleToggle} isOpen={isOpen} />
        )}
      </StyledResultsPanel>
    </>
  );
};

export default ResultsPanel;
