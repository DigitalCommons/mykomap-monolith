import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { type PopupItemConfig } from "../../../app/configSlice";
import PopupItems from "../PopupItems";
import DotCoopVerifiedBadge from "./dotCoopVerifiedBadge/DotCoopVerifiedBadge";

interface LeftPaneProps {
  data: { [key: string]: any };
  hasLocation: boolean;
  config: PopupItemConfig[];
  width: string;
  titleProp: string;
}

const StyledLeftPane = styled(Box)(({ width }) => ({
  width: "calc(100% - var(--spacing-xxxlarge))",
  display: "flex",
  flexDirection: "column",
  margin: "var(--spacing-large)",
  "@media (min-width: 768px)": {
    width: width,
    flexDirection: "column",
    margin:
      "var(--spacing-large) 0 var(--spacing-xlarge) var(--spacing-xlarge)",
    overflowY: "hidden",
  },
}));

const StyledHeaderContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  columnGap: "var(--spacing-medium)",
  padding: "0 0 var(--spacing-medium) 0",
  backgroundColor: "#ffffff",
  top: 0,
  left: 0,
  "& h1": {
    fontSize: "var(--font-size-xxlarge)",
    color: "var(--color-primary)",
  },
  "@media (min-width: 768px)": {
    position: "sticky",
    padding: "0 var(--spacing-xlarge) var(--spacing-large) 0",
    "& h1": {
      fontSize: "26px",
    },
  },
}));

const StyledHeaderTitle = styled(Typography)(() => ({
  overflowWrap: "break-word",
  minWidth: 0,
}));

const StyledContentContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  whiteSpace: "pre-line",
  paddingRight: 0,
  marginRight: 0,
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1)",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: "8px",
  },
  "& h4": {
    fontSize: "var(--font-size-small)",
    color: "var(--color-primary)",
    marginBottom: "var(--spacing-xsmall)",
  },
  "& p": {
    fontSize: "var(--font-size-small)",
  },
  "@media (min-width: 768px)": {
    overflowY: "auto",
    paddingRight: "var(--spacing-large)",
    marginRight: "var(--spacing-small)",
  },
}));

const LeftPane = ({
  data,
  hasLocation,
  config,
  width,
  titleProp,
}: LeftPaneProps) => {
  const { t } = useTranslation();
  const dataSources = data["data_sources"] || [];

  return (
    <StyledLeftPane width={width}>
      <StyledHeaderContainer>
        <StyledHeaderTitle variant="h1">{data[titleProp]}</StyledHeaderTitle>
        {dataSources?.includes("DotCooperation") && <DotCoopVerifiedBadge />}
      </StyledHeaderContainer>
      <StyledContentContainer>
        {!hasLocation && (
          <Typography variant="subtitle2">
            {t("no_location_available")}
          </Typography>
        )}
        <PopupItems data={data} config={config} />
      </StyledContentContainer>
    </StyledLeftPane>
  );
};

export default LeftPane;
