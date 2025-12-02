import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import NavBar from "./navBar/navBar";
import { styled } from "@mui/material/styles";
import PanelToggleButton from "../common/panelToggleButton/panelToggleButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseButton from "../common/closeButton/CloseButton";
import AboutPanel from "./aboutPanel/AboutPanel";
import DirectoryPanel from "./directoryPanel/DirectoryPanel";
import SearchPanel from "./searchPanel/SearchPanel";
import ApplyFilters from "./applyFilters/ApplyFilters";
import ResultsPanel from "../panel/resultsPanel/ResultsPanel";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  setSelectedTab,
  togglePanel,
  closePanel,
  selectSelectedTab,
  selectPanelOpen,
  selectResultsPanelOpen,
  openPanel,
  openResultsPanel,
} from "./panelSlice";
import {
  performSearch,
  selectIsFilterActive,
  selectVisibleIndexes,
} from "../panel/searchPanel/searchSlice";
import { useTranslation } from "react-i18next";

const StyledPanel = styled(Drawer)(() => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  flexShrink: 0,
  width: "calc(var(--panel-width-desktop) + 30px)",
  position: "relative",
  zIndex: 3,
  overflow: "visible",
  backgroundColor: "#fff",
  "& .MuiDrawer-paper": {
    width: "var(--panel-width-desktop)",
    boxSizing: "border-box",
    visibility: "visible !important",
    overflow: "visible",
    boxShadow: "0 0 20px rgba(0, 0, 0, 0.16)",
    borderRight: "none",
  },
}));

const StyledBox = styled(Box)(() => ({
  flexShrink: 0,
  position: "relative",
  zIndex: 3,
  overflow: "visible",
  backgroundColor: "#fff",
}));

const Panel = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectPanelOpen);
  const selectedTab = useAppSelector(selectSelectedTab);
  const resultsOpen = useAppSelector(selectResultsPanelOpen);
  const isFilterActive = useAppSelector(selectIsFilterActive);
  const visibleIndexes = useAppSelector(selectVisibleIndexes);
  const { t } = useTranslation();

  const isMedium = useMediaQuery("(min-width: 897px)");


  const handleToggle = () => {
    dispatch(togglePanel());
    console.log("isOpen", isOpen);
  };

  const handleTabChange = (tab: number) => {
    if (!isMedium && tab === 0) {
      dispatch(closePanel()); // Hide the panel if Map is selected on mobile
    } else {
      dispatch(openPanel()); // Show the panel if any other tab is selected
    }

    if (!isMedium && tab === 2 && isFilterActive && visibleIndexes.length > 0) {
      dispatch(openResultsPanel()); // Open results panel on mobile if there are results
    }

    dispatch(setSelectedTab(tab));
    console.log("tab", tab);
  };

  const handlePanelClose = () => {
    dispatch(closePanel());
    if (!isMedium) dispatch(setSelectedTab(0));
    console.log("isOpen", isOpen);
  };

  const handleMapTapClick = () => {
    dispatch(closePanel());
    dispatch(setSelectedTab(0));
  };

  const onApplyFilters = async () => {
    console.log(`Applying filters`);
    await dispatch(performSearch());
    dispatch(openResultsPanel());
  };

  return (
    <>
      {/* Desktop view  */}
      {isMedium && (
        <Box>
          <StyledPanel variant="persistent" open={isOpen} anchor="left">
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <NavBar onTabChange={handleTabChange} selectedTab={selectedTab} />
              {selectedTab === 0 && <DirectoryPanel />}
              {selectedTab === 1 && <SearchPanel />}
              {selectedTab === 2 && <AboutPanel />}
            </Box>
            {!(isOpen && resultsOpen) && (
              <PanelToggleButton buttonAction={handleToggle} isOpen={isOpen} />
            )}
          </StyledPanel>
        </Box>
      )}

      {/* Mobile view  */}
      {!isMedium && (
        <StyledBox>
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              height: selectedTab !== 0 ? "calc(100vh - 60px)" : "auto",
              "@media screen and (min-height: 415px)": {
                height: selectedTab !== 0 ? "calc(100vh - 80px)" : "auto",
              },
            }}
          >
            {isOpen && (
              <>
                <CloseButton buttonAction={handlePanelClose} />
                {selectedTab === 1 && <DirectoryPanel />}
                {selectedTab === 2 && <SearchPanel />}
                {selectedTab === 3 && <AboutPanel />}
              </>
            )}
            <Box
              sx={{
                position: "fixed",
                bottom: 0,
                width: "100%",
                backgroundColor: "var(--color-primary)",
                boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.2)",
              }}
            >
              {selectedTab === 2 && (
                <ApplyFilters
                  buttonText={t("apply_filters")}
                  buttonAction={onApplyFilters}
                  disabled={!isFilterActive}
                />
              )}
              <NavBar
                onTabChange={handleTabChange}
                selectedTab={selectedTab}
                onMapTabClick={handleMapTapClick}
              />
            </Box>
          </Box>
        </StyledBox>
      )}

      <ResultsPanel />
    </>
  );
};

export default Panel;
