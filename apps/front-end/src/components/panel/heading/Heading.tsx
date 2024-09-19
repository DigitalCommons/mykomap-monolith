import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface HeadingProps {
  title: string;
  children?: React.ReactNode;
}

const Heading = ({title, children}: HeadingProps) => {
  return (
    <Box
      sx={{
        padding: "var(--spacing-large)",
        backgroundColor: "var(--color-neutral-light)",
      }}
    >
      <Typography
        variant="h1"
        component="h1"
        sx={{ color: "var(--color-text)" }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
};

export default Heading;
