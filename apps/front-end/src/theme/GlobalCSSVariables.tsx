import { GlobalStyles } from "@mui/material";
import type { FC } from "react";

// Resuable CSS variables
const rootVariables = {
  "--color-primary": "#4D8C63",
  "--color-primary-light": "#639C7A",
  "--color-secondary": "#3E4854",
  "--color-secondary-light": "#535F6D",
  "--color-text": "#707070",
  "--color-neutral-light": "#F1F1F1",
  "--border-radius-small": "7px",
  "--spacing-xsmall": "4px",
  "--spacing-small": "8px",
  "--spacing-medium": "16px",
  "--spacing-large": "24px",
  "--spacing-xlarge": "32px",
  "--spacing-xxlarge": "40px",
  "--spacing-xxxlarge": "48px",
  "--panel-width-desktop": "450px",
  "--font-size-xsmall": "12px",
  "--font-size-small": "14px",
  "--font-size-medium": "16px",
  "--font-size-large": "18px",
  "--font-size-xlarge": "20px",
  "--font-size-xxlarge": "24px",
  "--font-size-xxxlarge": "32px",
  "--font-weight-normal": 400,
  "--font-weight-medium": 500,
  "--font-weight-bold": 600,
};

const GlobalCSSVariables: FC = () => {
  return (
    <GlobalStyles
      styles={{
        ":root": rootVariables,
      }}
    />
  );
};

export default GlobalCSSVariables;
