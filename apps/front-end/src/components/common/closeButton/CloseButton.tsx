import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import CancelIcon from "@mui/icons-material/Cancel";
import type { SxProps } from "@mui/system";

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
        top: "var(--spacing-small)",
        right: "var(--spacing-small)",
        ...sx, // Allow custom sx props to be passed in for flexibility
      }}
    >
      <Box
        sx={{
          height: 18,
          width: 18,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          borderRadius: "50%",
        }}
      />
      <CancelIcon
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />
    </IconButton>
  );
};

export default CloseButton;
