import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import theme from "../../../theme/theme";

const StyledMapKeyContainer = styled(Box)(() => ({
  width: "fit-content",
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 10,
  pointerEvents: "none",
  "@media (min-width: 768px)": {
    top: 55,
    right: 63,
    left: "auto",
    alignItems: "flex-end",
  },
}));

const StyledMapKeyButton = styled(Button)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  padding: "var(--spacing-small) var(--spacing-medium)",
  borderRadius: "var(--border-radius-small)",
  backgroundColor: theme.palette.secondary.light,
  color: "#fff",
  textTransform: "none",
  fontWeight: "var(--font-weight-medium)",
  fontSize: "var(--font-size-small)",
  pointerEvents: "auto", // Enable clicks on the button
}));

const StyledMapKey = styled(Paper)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  padding: "var(--spacing-small) !important",
  maxWidth: "var(--panel-width-desktop)",
  margin: "0 auto",
  borderRadius: "var(--border-radius-small)",
  "@media (min-width: 768px)": {
    padding: "var(--spacing-large) 0",
  },
}));

const MapKey = () => {
  return (
    <StyledMapKeyContainer>
      <StyledMapKeyButton>
        <FormatListBulletedIcon /> Map Key
      </StyledMapKeyButton>
      <StyledMapKey elevation={4}>
        <Stack spacing={2} padding={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={16} height={16} bgcolor={theme.palette.primary.main} />
            <Box>Category 1</Box>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Box width={16} height={16} bgcolor={theme.palette.primary.light} />
            <Box>Category 2</Box>
          </Box>
        </Stack>
      </StyledMapKey>
    </StyledMapKeyContainer>
  );
};

export default MapKey;
