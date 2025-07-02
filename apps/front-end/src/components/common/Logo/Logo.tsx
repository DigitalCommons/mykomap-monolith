import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { selectLogo } from "../../../app/configSlice";
import { useAppSelector } from "../../../app/hooks";

interface LogoPositionProps {
  smallScreenPosition?: {
    top?: string;
    left?: string;
  };
  largeScreenPosition?: {
    bottom?: string;
    right?: string;
  };
}

const StyledLogoWrapper = styled(Box)<LogoPositionProps>(
  ({ smallScreenPosition, largeScreenPosition }) => ({
    position: "fixed",
    top: smallScreenPosition?.top || "10px",
    left: smallScreenPosition?.left || "10px",
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
      bottom: largeScreenPosition?.bottom || "20px",
      right: largeScreenPosition?.right || "20px",
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
  }),
);

const Logo = () => {
  const isMedium = useMediaQuery("(min-width: 897px)");
  const logoConfig = useAppSelector(selectLogo);

  if (!logoConfig || (!logoConfig.largeLogo && !logoConfig.smallLogo)) {
    return null;
  }

  const largeLogo = logoConfig.largeLogo;
  const smallLogo = logoConfig.smallLogo;
  const altText = logoConfig.altText;

  const smallScreenPosition = logoConfig.smallScreenPosition;
  const largeScreenPosition = logoConfig.largeScreenPosition;

  return (
    <StyledLogoWrapper
      smallScreenPosition={smallScreenPosition}
      largeScreenPosition={largeScreenPosition}
    >
      {isMedium ? (
        <img src={largeLogo || smallLogo} className="large" alt={altText} />
      ) : (
        <img src={smallLogo || largeLogo} className="small" alt={altText} />
      )}
    </StyledLogoWrapper>
  );
};

export default Logo;
