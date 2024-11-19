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
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isMedium = useMediaQuery("(min-width: 897px)");

  const handleChange = (e: React.SyntheticEvent, selected: number) => {
    if (onTabChange) {
      onTabChange(selected);
    }
    dispatch(setSelectedTab(selected));
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
          <Tab
            icon={<MapIcon />}
            label={t("map")}
            onClick={handleMapTabClick}
          />
        )}
        <Tab icon={<SignpostIcon />} label={t("directory")} />
        <Tab icon={<SearchIcon />} label={t("search")} />
        <Tab icon={<InfoIcon />} label={t("about")} />
      </Tabs>
    </StyledTabContainer>
  );
};

export default NavBar;
