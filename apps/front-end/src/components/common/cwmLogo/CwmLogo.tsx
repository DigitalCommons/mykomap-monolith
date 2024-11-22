import CWMLogo from "./cwm-logo.png";
import CWMLogoSmall from "./cwm-logo-small.png";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

const StyledLogoWrapper = styled(Box)(() => ({
  position: "fixed",
  top: "0",
  left: "5px",
  zIndex: 0,
  "& img": {
    width: "100%",
    maxWidth: "50px",
    "&.small": {
      display: "block",
    },
    "&.large": {
      display: "none",
    },
  },
  "@media (min-width: 897px)": {
    bottom: "-25px",
    right: "-5px",
    top: "unset",
    left: "unset",
    "& img": {
      width: "100%",
      maxWidth: "150px",
      "&.small": {
        display: "none",
      },
      "&.large": {
        display: "block",
      },
    },
  },
}));

const CwmLogo = () => {
  const isMedium = useMediaQuery("(min-width: 897px)");
  return (
    <StyledLogoWrapper>
      {isMedium && (
        <img src={CWMLogo} className="large" alt="Cooperative World Map Logo" />
      )}
      {!isMedium && (
        <img
          src={CWMLogoSmall}
          className="small"
          alt="Cooperative World Map Logo"
        />
      )}
    </StyledLogoWrapper>
  );
};

export default CwmLogo;
