import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SignpostIcon from "@mui/icons-material/Signpost";
import InfoIcon from "@mui/icons-material/Info";
import SearchIcon from "@mui/icons-material/Search";
import MapIcon from "@mui/icons-material/Map";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import { useAppDispatch } from "../../../app/hooks";
import { setSelectedTab } from "../../panel/panelSlice";
import { styled } from "@mui/material/styles";

interface NavBarProps {
  onTabChange?: (selected: number) => void;
  onMapTabClick?: () => void;
  selectedTab?: number;
}

const StyledTabContainer = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  justifyContent: "flex-end",
  backgroudColor: "var(--color-primary)",
}));

const NavBar = ({ onTabChange, onMapTabClick, selectedTab }: NavBarProps) => {
  const dispatch = useAppDispatch();
  const isMedium = useMediaQuery("(min-width: 897px)");

  const handleChange = (e: React.SyntheticEvent, selected: number) => {
    if (onTabChange) {
      onTabChange(selected);
    }
    dispatch(setSelectedTab(selected));
    console.log("selected", selected);
  };

  const handleMapTabClick = () => {
    if (onMapTabClick) {
      onMapTabClick();
    }
  };

  return (
    <StyledTabContainer>
      <Tabs value={selectedTab} onChange={handleChange}>
        {!isMedium && (
          <Tab icon={<MapIcon />} label="Map" onClick={handleMapTabClick} />
        )}
        <Tab icon={<SignpostIcon />} label="Directory" />
        <Tab icon={<SearchIcon />} label="Search" />
        <Tab icon={<InfoIcon />} label="About" />
      </Tabs>
    </StyledTabContainer>
  );
};

export default NavBar;
