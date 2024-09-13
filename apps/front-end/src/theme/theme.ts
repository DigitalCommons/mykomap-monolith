import { createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: "#4D8C63",
      light: "#639C7A",
    },
    secondary: {
      main: "#3E4854",
      light: "#535F6D",
    },
    text: {
      primary: "#707070",
    },
  },
  typography: {
    button: {
      textTransform: "none",
      fontWeight: 400,
      color: "#fff",
      fontSize: "14px",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "var(--border-radius-small)",
          // "&.Mui-disabled": {
          //   backgroundColor: "var(--color-neutral-light)",
          //   color: "fuchsia",
          // },
        },
        // Primary button styles
        containedPrimary: {
          backgroundColor: "var(--color-primary)",
          color: "#fff",
          "&:hover": {
            backgroundColor: "var(--color-primary-light)",
          },
        },
        // Secondary button styles
        containedSecondary: {
          backgroundColor: "var(--color-secondary)",
          color: "#fff",
          "&:hover": {
            backgroundColor: "var(--color-secondary-light)",
          },
        },
      },
    },
    MuiInput: {
      styleOverrides: {
        root: {
          borderRadius: "var(--border-radius-small)",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--color-neutral-light)",
          borderRadius: "var(--border-radius-small)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          width: "240px",
          color: "var(--color-text)",
          backgroundColor: "#fff'",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "var(--color-primary)",
          color: "var(--color-text)",
        },
      },
    },
  },
};

// const theme = createTheme(themeOptions, { cssVariables: true });
const theme = createTheme(themeOptions);

export default theme;
