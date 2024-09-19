import React, { useState } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SignpostIcon from "@mui/icons-material/Signpost";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";

interface NavBarProps {
  onTabChange?: (selected: number) => void;
}

const NavBar = ({ onTabChange }: NavBarProps) => {
  const [selectedTab, setSelectedTab] = useState(0); // Track the selected tab

  const handleChange = (e: React.SyntheticEvent, selected: number) => {
    setSelectedTab(selected);
    if (onTabChange) {
      onTabChange(selected);
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
        <Tab icon={<SignpostIcon />} label="Directory" disableRipple />
        <Tab icon={<SearchIcon />} label="Search" disableRipple />
        <Tab icon={<InfoIcon />} label="About" disableRipple />
      </Tabs>
    </Box>
  );
};

export default NavBar;
