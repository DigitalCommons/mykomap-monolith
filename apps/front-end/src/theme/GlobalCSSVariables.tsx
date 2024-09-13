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
