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
        padding: "var(--spacing-medium)",
        backgroundColor: "var(--color-neutral-light)",
        "@media (min-width: 768px)": {
          padding: "var(--spacing-large)",
        },
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
