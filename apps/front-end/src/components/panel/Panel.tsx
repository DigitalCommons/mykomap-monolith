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
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  setSelectedTab,
  setPanelVisible,
  togglePanel,
  closePanel,
  selectSelectedTab,
  selectPanelVisible,
  selectIsOpen,
} from "./panelSlice";

const StyledPanel = styled(Drawer)(() => ({
  display: "flex",
  flexDirection: "column",
  height: "100%",
  flexShrink: 0,
  width: "calc(var(--panel-width-desktop) + 30px)",
  position: "relative",
  overflow: "visible",
  backgroundColor: "#fff",
  "& .MuiDrawer-paper": {
    width: "var(--panel-width-desktop)",
    boxSizing: "border-box",
    visibility: "visible !important",
    overflow: "visible",
    boxShadow: "0 0 20px rgba(0, 0, 0, 0.16)",
  },
}));

const StyledBox = styled(Box)(() => ({
  flexShrink: 0,
  position: "relative",
  overflow: "visible",
  backgroundColor: "#fff",
}));

const Panel = () => {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsOpen);
  const selectedTab = useAppSelector(selectSelectedTab);
  const panelVisible = useAppSelector(selectPanelVisible);

  const isMedium = useMediaQuery("(min-width: 897px)");

  const handleToggle = () => {
    dispatch(togglePanel());
    console.log("isOpen", isOpen);
  };

  const handleTabChange = (tab: number) => {
    if (tab === 0) {
      dispatch(setPanelVisible(false)); // Hide the panel if Map is selected
    } else {
      dispatch(setPanelVisible(true)); // Show the panel if any other tab is selected
    }
    dispatch(setSelectedTab(tab));
    console.log("tab", tab);
  };

  const handlePanelClose = () => {
    dispatch(closePanel());
    dispatch(setSelectedTab(0));
    console.log("panelVisible", panelVisible);
  };

  const handleMapTapClick = () => {
    dispatch(setPanelVisible(false));
    dispatch(setSelectedTab(0));
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
            <PanelToggleButton buttonAction={handleToggle} isOpen={isOpen} />
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
            {panelVisible && (
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
              <NavBar
                onTabChange={handleTabChange}
                selectedTab={selectedTab}
                onMapTabClick={handleMapTapClick}
              />
            </Box>
          </Box>
        </StyledBox>
      )}
    </>
  );
};

export default Panel;
