import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { type PopupItem } from "../../../app/configSlice";
import PopupItems from "../PopupItems";

interface RightPaneProps {
  data: { [key: string]: any };
  configTop: PopupItem[];
  configBottom: PopupItem[];
}

const StyledRightPane = styled(Box)(() => ({
  backgroundColor: "var(--color-secondary-light)",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  justifyContent: "space-between",
  color: "#fff",
  fontSize: "var(--font-size-medium)",
  lineHeight: "var(--line-height-medium)",
  "@media (min-width: 768px)": {
    overflowY: "hidden",
    borderRadius: "0 var(--border-radius-xlarge) var(--border-radius-xlarge) 0",
  },
}));

const StyledTopBox = styled(Box)(() => ({
  backgroundColor: "var(--color-secondary-light)",
  padding: "var(--spacing-large) var(--spacing-xlarge)",
  borderTopRightRadius: 0,
  "& p": {
    fontSize: "var(--font-size-small)",
  },
  "& a": {
    fontSize: "var(--font-size-small)",
  },
  "@media (min-width: 768px)": {
    borderTopRightRadius: "var(--border-radius-xlarge)",
  },
  "& li": {
    display: "list-item",
    marginLeft: 0,
  },
}));

const StyledBottomBox = styled(Box)(() => ({
  backgroundColor: "var(--color-secondary)",
  padding: "var(--spacing-large) var(--spacing-xlarge) var(--spacing-xlarge)",
  "& h4, & p, & li": {
    fontSize: "var(--font-size-small)",
  },
  "& h4": {
    color: "#ffffffB3",
    marginBottom: "var(--spacing-xsmall) !important",
  },
  "& ul": {
    listStyleType: "unset",
    margin: "unset",
    padding: "unset",
  },
  "& li": {
    display: "list-item",
    marginLeft: "var(--spacing-medium)",
  },
  "@media (min-width: 768px)": {
    overflowY: "auto",
    paddingRight: "var(--spacing-large)",
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
  },
}));

const RightPane = ({ data, configTop, configBottom }: RightPaneProps) => {
  return (
    <StyledRightPane>
      <StyledTopBox>
        <PopupItems data={data} config={configTop} />
      </StyledTopBox>
      {configBottom.length > 0 && (
        <StyledBottomBox>
          <PopupItems data={data} config={configBottom} />
        </StyledBottomBox>
      )}
    </StyledRightPane>
  );
};

export default RightPane;
