import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

interface PanelToggleButtonProps {
  buttonAction: () => void;
  isOpen: boolean;
}

const PanelToggleButton = ({
  buttonAction,
  isOpen,
}: PanelToggleButtonProps) => {
  return (
    <IconButton
      onClick={buttonAction}
      aria-label={isOpen ? "Close panel" : "Open panel"}
      id="panel-toggle-button"
      title="Toggle Button"
      sx={{
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
      }}
    >
      {isOpen ? <ArrowBackIosNewIcon /> : <ChevronRightIcon />}
    </IconButton>
  );
};

export default PanelToggleButton;
