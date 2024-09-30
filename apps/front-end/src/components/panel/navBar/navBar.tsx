import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SignpostIcon from "@mui/icons-material/Signpost";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";

interface NavBarProps {
  onTabChange?: (selected: number) => void;
  onMapTabClick?: () => void;
}

const NavBar = ({ onTabChange, onMapTabClick }: NavBarProps) => {
  const [selectedTab, setSelectedTab] = useState(0); // Track the selected tab

  const isMobile = useMediaQuery("(max-width: 768px)");

  const handleChange = (e: React.SyntheticEvent, selected: number) => {
    setSelectedTab(selected);
    if (onTabChange) {
      onTabChange(selected);
    }
  };

  const handleMapTabClick = () => {
    if (onMapTabClick) {
      onMapTabClick(); // Inform parent that the Map tab is selected
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "flex-end",
        backgroudColor: "var(--color-primary)",
      }}
    >
      <Tabs value={selectedTab} onChange={handleChange}>
        {isMobile && (
          <Tab
            icon={<MapIcon />}
            label="Map"
            disableRipple
            onClick={handleMapTabClick}
          />
        )}
        <Tab icon={<SignpostIcon />} label="Directory" disableRipple />
        <Tab icon={<SearchIcon />} label="Search" disableRipple />
        <Tab icon={<InfoIcon />} label="About" disableRipple />
      </Tabs>
    </Box>
  );
};

export default NavBar;
