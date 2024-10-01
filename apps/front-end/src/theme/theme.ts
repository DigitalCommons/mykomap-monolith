import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import type { ThemeOptions } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const themeOptions: ThemeOptions = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 900,
      lg: 1280,
      xl: 1920,
    },
  },
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
    h1: {
      fontSize: "30px",
      textAlign: "left",
      fontWeight: 500,
    },
  },
  components: {
    MuiTabs: {
      styleOverrides: {
        root: {
          width: "100%",
          backgroundColor: "var(--color-primary)",
          borderRadius: "0",
          "& .MuiTabs-flexContainer": {
            justifyContent: "center",
          },
          "@media (min-width: 897px)": {
            "& .MuiTabs-flexContainer": {
              justifyContent: "flex-end",
            },
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          height: "60px",
          width: "25%",
          minHeight: "unset",
          minWidth: "unset",
          maxWidth: "110px",
          textTransform: "none",
          fontWeight: 400,
          fontSize: "0",
          color: "#ffffffcc",
          backgroundColor: "var(--color-primary)",
          transition: "ease-in 0.25s",
          "&.Mui-selected": {
            color: "#fff",
            backgroundColor: "var(--color-primary-light)",
          },
          "& .MuiTab-icon": {
            marginBottom: 0,
          },
          "@media (min-width: 897px)": {
            height: "100px",
            width: "100px",
            fontSize: "14px",
          },
          "@media screen and (min-height: 415px)": {
            height: "80px",
            fontSize: "12px",
            "& .MuiTab-icon": {
              marginBottom: "var(--spacing-small)",
            },
          },
        },
      },
    },
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
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "var(--color-primary-light)",
          padding: 0,
          borderRadius: "unset",
          transition: "none",
          "&:hover": {
            backgroundColor: "transparent",
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
        root: {
          backgroundColor: "transparent",
        },
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
