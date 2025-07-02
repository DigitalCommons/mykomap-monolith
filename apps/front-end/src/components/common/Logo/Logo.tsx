import CWMLogo from "./cwm-logo.png";
import CWMLogoSmall from "./cwm-logo-small.png";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { selectLogo } from "../../../app/configSlice";
import { useAppSelector } from "../../../app/hooks";

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

const Logo = () => {
  const isMedium = useMediaQuery("(min-width: 897px)");
  const logoConfig = useAppSelector(selectLogo);

  console.log("CwmLogo", logoConfig);

  if (!logoConfig || !logoConfig?.showLogo) {
    return null; // Do not render the logo if showLogo is false
  }

  const largeLogo = logoConfig.largeLogo;
  const smallLogo = logoConfig.smallLogo;
  const altText = logoConfig.altText;

  return (
    <StyledLogoWrapper>
      {isMedium && <img src={largeLogo} className="large" alt={altText} />}
      {!isMedium && <img src={smallLogo} className="small" alt={altText} />}
    </StyledLogoWrapper>
  );
};

export default Logo;
