import { createTheme } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
    MuiOutlinedInput: {
      styleOverrides: {
        notchedOutline: {
          borderColor: "transparent",
        },
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "transparent", // Remove outline on hover
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "transparent", // Remove outline when focused
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
      defaultProps: {
        IconComponent: ExpandMoreIcon,
      },
      styleOverrides: {
        root: {
          width: "100%",
          backgroundColor: "var(--color-neutral-light)",
          borderRadius: "var(--border-radius-small)",
          padding: "var(--spacing-small) var(--spacing-medium)",
          boxShadow: "none",
          border: "2px solid var(--color-neutral-light)",
          transition: "border 0.25s ease-in-out",
          "&.Mui-focused, &:focus": {
            border: "2px solid var(--color-primary-light)",
          },
          "&:hover": {
            border: "2px solid var(--color-primary-light)",
          },
          "& .MuiSelect-select": {
            padding: "0",
          },
        },
        select: {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          marginTop: "var(--spacing-small)",
          borderRadius: "var(--border-radius-small)",
          border: "2px solid var(--color-primary-light)",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: "var(--color-neutral-light)",
          },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          width: "100%",
          color: "var(--color-text)",
          fontWeight: 600,
          marginBottom: "var(--spacing-small)",
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
