import React from "react";
import Button from "@mui/material/Button";

interface ButtonProps {
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary";
  intent?: "cta";
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
  intent,
  ...props
}: ButtonProps) => {
  return (
    <Button
      variant={variant}
      color={color}
      intent={intent}
      onClick={buttonAction}
      disabled={disabled}
      {...props}
    >
      {children}
    </Button>
  );
};

export default StandardButton;
