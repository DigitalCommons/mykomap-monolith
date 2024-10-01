import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import NavBar from "./navBar/navBar";
import PanelToggleButton from "../common/panelToggleButton/panelToggleButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseButton from "../common/closeButton/CloseButton";
import AboutPanel from "./aboutPanel/AboutPanel";
import DirectoryPanel from "./directoryPanel/DirectoryPanel";
import SearchPanel from "./searchPanel/SearchPanel";

const Panel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [panelVisible, setPanelVisible] = useState(false);

  const isMedium = useMediaQuery("(min-width: 897px)");
  

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleTabChange = (tab: number) => {
    if (tab === -1) {
      setPanelVisible(false); // Hide the panel if Map is selected
    } else {
      setPanelVisible(true); // Show the panel if any other tab is selected
    }
    setSelectedTab(tab);
  };

  const handlePanelClose = () => {
    setPanelVisible(false);
  };

  const handleMapTapClick = () => {
    setPanelVisible(false); // Hide all panels when the Map tab is clicked
    setSelectedTab(-1); // Select the Map tab
  };

  return (
    <>
      {/* Container for testing only */}
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#E2DFD2",
        }}
      >
        {/* Desktop view  */}
        {isMedium && (
          <Box>
            <Drawer
              variant="persistent"
              open={isOpen}
              anchor="left"
              sx={{
                flexShrink: 0,
                width: "calc(var(--panel-width-desktop) + 30px)",
                position: "relative",
                overflow: "visible",
                "& .MuiDrawer-paper": {
                  width: "var(--panel-width-desktop)",
                  boxSizing: "border-box",
                  backgroundColor: "#fff",
                  visibility: "visible !important",
                  overflow: "visible",
                  boxShadow: "0 0 20px rgba(0, 0, 0, 0.16)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <NavBar onTabChange={handleTabChange} />
                <Box sx={{ flexGrow: 1 }}>
                  {selectedTab === 0 && <DirectoryPanel />}
                  {selectedTab === 1 && <SearchPanel />}
                  {selectedTab === 2 && <AboutPanel />}
                </Box>
              </Box>
              <PanelToggleButton buttonAction={handleToggle} isOpen={isOpen} />
            </Drawer>
          </Box>
        )}

        {/* Mobile view  */}
        {!isMedium && (
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {panelVisible && (
              <>
                <CloseButton buttonAction={handlePanelClose} />
                <Box sx={{ flexGrow: 1, backgroundColor: "#fff" }}>
                  {selectedTab === 1 && <DirectoryPanel />}
                  {selectedTab === 2 && <SearchPanel />}
                  {selectedTab === 3 && <AboutPanel />}
                </Box>
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
                onMapTabClick={handleMapTapClick}
              />
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};

export default Panel;
