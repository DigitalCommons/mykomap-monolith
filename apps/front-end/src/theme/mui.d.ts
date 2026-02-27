import "@mui/material/Button";

declare module "@mui/material/Button" {
  interface ButtonOwnProps {
    intent?: "cta";
  }
}
