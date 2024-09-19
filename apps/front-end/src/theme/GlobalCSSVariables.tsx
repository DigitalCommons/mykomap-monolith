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
