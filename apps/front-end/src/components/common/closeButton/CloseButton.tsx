import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";
import { SxProps } from "@mui/material";

interface CloseButtonProps {
  buttonAction?: () => void;
  sx?: SxProps;
}

const CloseButton = ({ buttonAction, sx }: CloseButtonProps) => {
  return (
    <IconButton
      aria-label="close"
      onClick={buttonAction}
      sx={{
        height: 20,
        width: 20,
        position: "absolute",
        top: "var(--spacing-xsmall)",
        right: "var(--spacing-xsmall)",
        ...sx, // Allow custom sx props to be passed in for flexibility
      }}
    >
      <CancelIcon />
    </IconButton>
  );
};

export default CloseButton;
