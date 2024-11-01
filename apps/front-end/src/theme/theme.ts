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
      fontWeight: "var(--font-weight-normal)",
      color: "#fff",
      fontSize: "var(--font-size-small)",
    },
    h1: {
      fontSize: "var(--font-size-xxlarge)",
      textAlign: "left",
      fontWeight: "var(--font-weight-medium)",
      "@media (min-width: 600px)": {
        fontSize: "var(--font-size-xxxlarge)",
      },
    },
    h4: {
      fontSize: "var(--font-size-medium)",
      fontWeight: "var(--font-weight-medium)",
      marginBottom: "var(--spacing-small)",
      color: "var(--color-primary)",
      "@media (min-width: 600px)": {
        fontSize: "var(--font-size-large)",
        marginBottom: "var(--spacing-medium)",
      },
    },
    h5: {
      fontSize: "var(-font-size-small)",
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
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          height: "60px",
          width: "25%",
          minHeight: "unset",
          minWidth: "unset",
          maxWidth: "110px",
          textTransform: "none",
          fontWeight: "var(--font-weight-normal)",
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
            fontSize: "var(--font-size-small)",
          },
          "@media screen and (min-height: 415px)": {
            height: "80px",
            fontSize: "var(--font-size-xsmall)",
            "& .MuiTab-icon": {
              marginBottom: "var(--spacing-small)",
            },
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          borderRadius: "var(--border-radius-small)",
          boxShadow: "0 0 8px rgba(0, 0, 0, 0.16)",
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
    MuiLink: {
      styleOverrides: {
        root: {
          width: "100%",
          padding: "var(--spacing-small) var(--spacing-medium)",
          display: "block",
          textDecoration: "none",
          fontWeight: "var(--font-weight-medium)",
          "@media (min-width: 768px)": {
            padding: "var(--spacing-small) var(--spacing-large)",
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
          marginBottom: "var(--spacing-medium)",
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
          "@media (min-width: 600px)": {
            marginBottom: "var(--spacing-large)",
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
      defaultProps: {
        disableRipple: true,
      },
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
          fontWeight: "var(--font-weight-bold)",
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
    MuiList: {
      styleOverrides: {
        root: {
          padding: "0",
          margin: "0",
          listStyleType: "none",
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          padding: 0,
          margin: 0,
        },
      },
    },
  },
};

// const theme = createTheme(themeOptions, { cssVariables: true });
const theme = createTheme(themeOptions);

export default theme;
