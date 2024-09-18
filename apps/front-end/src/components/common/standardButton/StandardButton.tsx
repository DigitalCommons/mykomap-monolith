import React from "react";
import Button from "@mui/material/Button";

interface ButtonProps {
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary";
  children: React.ReactNode;
  disabled?: boolean;
  buttonAction?: () => void;
}

const StandardButton = ({
  variant = "contained",
  color,
  children,
  disabled = false,
  buttonAction,
  ...props
}: ButtonProps) => {
  return (
    <Button
      variant={variant}
      color={color}
      onClick={buttonAction}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
};

export default StandardButton;
