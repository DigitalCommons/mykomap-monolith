import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

interface ContentPanelProps {
  children?: React.ReactNode;
}

const StyledContentPanel = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  padding: "var(--spacing-medium)",
  maxWidth: "var(--panel-width-desktop)",
  margin: "0 auto",
  "@media (min-width: 897px)": {
    padding: "var(--spacing-large)",
    paddingTop: "5px",
  },
  "& .MuiLink-root": {
    padding: 0,
    display: "inline",
  },
  "& .MuiTypography-root": {
    marginBlock: "25px",
  },
}));

const ContentPanel = ({ children }: ContentPanelProps) => {
  return <StyledContentPanel>{children}</StyledContentPanel>;
};

export default ContentPanel;
