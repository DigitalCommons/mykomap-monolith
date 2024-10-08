import IconButton from "@mui/material/IconButton";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { styled } from "@mui/material/styles";

interface PanelToggleButtonProps {
  buttonAction: () => void;
  isOpen: boolean;
}

const StyledIconButton = styled(IconButton)(() => ({
  height: 100,
  width: 30,
  position: "absolute",
  top: "50%",
  right: "-30px",
  transform: "translateY(-50%)",
  backgroundColor: "var(--color-primary)",
  color: "#fff",
  borderRadius: "0 var(--spacing-small) var(--spacing-small) 0",
  "&:hover": {
    backgroundColor: "var(--color-primary)",
  },
}));

const PanelToggleButton = ({
  buttonAction,
  isOpen,
}: PanelToggleButtonProps) => {
  return (
    <StyledIconButton
      onClick={buttonAction}
      aria-label={isOpen ? "Close panel" : "Open panel"}
      id="panel-toggle-button"
      title="Toggle Button"
    >
      {isOpen ? <ArrowBackIosNewIcon /> : <ArrowForwardIosIcon />}
    </StyledIconButton>
  );
};

export default PanelToggleButton;
