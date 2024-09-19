import { useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import NavBar from "./navBar/navBar";
import Heading from "./heading/Heading";
import PanelToggleButton from "../common/panelToggleButton/panelToggleButton";

const Panel = () => {
  const [isOpen, setIsOpen] = useState(true);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  return (
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
          <NavBar />
          <Heading title="My Panel" />
        </Box>
        <PanelToggleButton buttonAction={handleToggle} isOpen={isOpen} />
      </Drawer>
    </Box>
  );
};

export default Panel;
