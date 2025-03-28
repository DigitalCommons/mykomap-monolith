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
  togglePanel,
  selectPanelOpen,
  selectResultsPanelOpen,
  closeResultsPanel,
} from "../panelSlice";
import { clearSearch } from "../searchPanel/searchSlice";
import { useTranslation } from "react-i18next";
import { keyframes } from "@emotion/react";

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-100%);
  }
`;

const StyledResultsPanel = styled(Drawer)<{
  onClosePanel?: boolean;
}>(({ onClosePanel }) => ({
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
    animation: `${onClosePanel ? slideOut : slideIn} 0.3s ease forwards`,
  },

  "@media (min-width: 897px)": {
    width: "calc(var(--panel-width-desktop) + 30px)",
    transform: "translateX(var(--panel-width-desktop))",

    "& .MuiDrawer-paper": {
      width: "var(--panel-width-desktop)",
    },
  },
}));

const StyledButtonContainer = styled(Box)(() => ({
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
  const { t } = useTranslation();
  const panelOpen = useAppSelector(selectPanelOpen);
  const resultsPanelOpen = useAppSelector(selectResultsPanelOpen);

  console.log("resultsPanelOpen", resultsPanelOpen);

  const isMedium = useMediaQuery("(min-width: 897px)");

  const handleToggle = () => {
    dispatch(togglePanel());
  };

  const handlePanelClose = () => {
    dispatch(closeResultsPanel());
    console.log("panelOpen", panelOpen);
  };

  const handleClearSearch = () => {
    dispatch(closeResultsPanel());
    dispatch(clearSearch());
  };

  return (
    <>
      {panelOpen && resultsPanelOpen && (
        <StyledResultsPanel
          open={panelOpen && resultsPanelOpen}
          onClosePanel={!(panelOpen && resultsPanelOpen)}
          variant="persistent"
          anchor="left"
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <StyledButtonContainer>
              <StandardButton buttonAction={handleClearSearch}>
                {t("clear_search")}
              </StandardButton>
              {!isMedium && <CloseButton buttonAction={handlePanelClose} />}
            </StyledButtonContainer>
            <Results />
          </Box>
          {isMedium && (
            <PanelToggleButton buttonAction={handleToggle} isOpen={panelOpen} />
          )}
        </StyledResultsPanel>
      )}
    </>
  );
};

export default ResultsPanel;
