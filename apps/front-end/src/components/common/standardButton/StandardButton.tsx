import React from "react";
import Button from "@mui/material/Button";

interface ButtonProps {
  variant?: "contained" | "outlined" | "text";
  color?: "primary" | "secondary";
  children: React.ReactNode;
  disabled?: boolean;
}

const StandardButton = ({
  variant = "contained",
  color,
  children,
  disabled = false,
  ...props
}: ButtonProps) => {
  return (
    <Button variant={variant} color={color} disabled={disabled} {...props}>
      {children}
    </Button>
  );
};

export default StandardButton;
