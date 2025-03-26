import { useEffect, useState } from "react";
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
  closePanel,
  setSelectedTab,
} from "../panelSlice";
import { clearSearch } from "../searchPanel/searchSlice";
import { useTranslation } from "react-i18next";
import { keyframes } from "@emotion/react";

const slideIn = keyframes`
  from {
    transform: translateX(-100%);
    // opacity: 0;
  }
  to {
    transform: translateX(0);
    // opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    // opacity: 1;
  }
  to {
    transform: translateX(-100%);
    // opacity: 0;
  }
`;

const StyledResultsPanel = styled(Drawer)<{
  onClosePanel?: boolean;
  isClosing?: boolean;
}>(({ onClosePanel, isClosing }) => ({
  width: "100%",
  height: "100vh",
  position: "relative",
  overflow: "visible",
  transition: "transform 0.3s ease, opacity 0.3s ease",

  "& .MuiDrawer-paper": {
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "var(--color-secondary)",
    overflow: "visible",
    boxShadow: "0 0 20px rgba(0, 0, 0, 0.16)",
    animation: `${onClosePanel ? slideOut : slideIn} 0.3s ease forwards`,
    visibility: isClosing ? "hidden" : "visible",
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

  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const animationDuration = 300;

  const isMedium = useMediaQuery("(min-width: 897px)");

  const handleToggle = () => {
    if (isMedium && panelOpen && resultsPanelOpen) {
      dispatch(closeResultsPanel());
      setTimeout(() => {
        dispatch(togglePanel());
      }, animationDuration);
    } else {
      dispatch(togglePanel());
    }
  };

  const handlePanelClose = () => {
    if (!isMedium) dispatch(setSelectedTab(0));
    dispatch(closePanel());
    dispatch(closeResultsPanel());
    console.log("panelOpen", panelOpen);
  };

  const handleClearSearch = () => {
    console.log("Clear search");
    if (!isMedium) dispatch(setSelectedTab(0));
    // dispatch(closePanel());
    dispatch(closeResultsPanel());
    dispatch(clearSearch());
  };

  useEffect(() => {
    if (panelOpen && resultsPanelOpen) {
      setIsVisible(true);
    } else {
      const timeout = setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);
      }, animationDuration);
      return () => clearTimeout(timeout);
    }
  }, [panelOpen, resultsPanelOpen]);

  return (
    <>
      {isVisible && (
        <StyledResultsPanel
          open={panelOpen && resultsPanelOpen}
          onClosePanel={!(panelOpen && resultsPanelOpen)}
          isClosing={isClosing}
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
          {isMedium && resultsPanelOpen && (
            <PanelToggleButton buttonAction={handleToggle} isOpen={panelOpen} />
          )}
        </StyledResultsPanel>
      )}
    </>
  );
};

export default ResultsPanel;
