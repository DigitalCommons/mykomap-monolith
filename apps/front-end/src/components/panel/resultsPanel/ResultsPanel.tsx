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
  toggleResultsPanel,
  selectResultsOpen,
} from "../panelSlice";
import {
  setText,
  performSearch,
} from "../searchPanel/searchSlice";

const StyledResultsPanel = styled(Drawer)(() => ({
  width: "100%",
  height: "100vh",
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
    transform: "translateX(var(--panel-width-desktop))", // Marcel: to fix
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

const ResultsPanel = ({
  onLinkClick,
  onTogglePanel,
  onClearSearch,
}: Record<string, unknown>) => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsOpen);
  const resultsOpen = useAppSelector(selectResultsOpen);

  console.log("resultsOpen", resultsOpen);

  const panelVisible = useAppSelector(selectPanelVisible);
  const isMedium = useMediaQuery("(min-width: 897px)");

  const handleToggle = () => {
    dispatch(togglePanel());
    dispatch(toggleResultsPanel());
    console.log("isOpen", isOpen);
  };

  const handlePanelClose = () => {
    dispatch(toggleResultsPanel());
    console.log("panelVisible", panelVisible);
  };

  const handleClearSearch = () => {
    console.log("Clear search");
    dispatch(toggleResultsPanel());
  };

  return (
    <>
      <StyledResultsPanel open={resultsOpen} variant="persistent">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}
        >
          <StyledButtonContainer>
            <StandardButton buttonAction={handleClearSearch}>
              Clear Search
            </StandardButton>
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
