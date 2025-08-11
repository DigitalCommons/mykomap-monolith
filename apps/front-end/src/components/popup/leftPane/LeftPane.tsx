import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { type PopupItem } from "../../../app/configSlice";
import PopupItems from "../PopupItems";

interface LeftPaneProps {
  data: { [key: string]: any };
  hasLocation: boolean;
  config: PopupItem[];
  titleProp: string;
}

const StyledLeftPane = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  margin: "var(--spacing-large)",
  "@media (min-width: 768px)": {
    width: "70%",
    flexDirection: "column",
    margin:
      "var(--spacing-large) 0 var(--spacing-xlarge) var(--spacing-xlarge)",
    overflowY: "hidden",
  },
}));

const StyledHeaderContainer = styled(Box)(() => ({
  // position: "sticky",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
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

const StyledContentContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  // overflowY: "auto",
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

const LeftPane = ({ data, hasLocation, config, titleProp }: LeftPaneProps) => {
  const { t } = useTranslation();

  return (
    <StyledLeftPane>
      <StyledHeaderContainer>
        <Typography variant="h1" sx={{ overflowWrap: "break-word" }}>
          {data[titleProp]}
        </Typography>
        {!hasLocation && (
          <Typography variant="subtitle2">
            {t("no_location_available")}
          </Typography>
        )}
      </StyledHeaderContainer>
      <StyledContentContainer>
        <PopupItems data={data} config={config} />
      </StyledContentContainer>
    </StyledLeftPane>
  );
};

export default LeftPane;
