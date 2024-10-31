import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

interface HeadingProps {
  title: string;
  children?: React.ReactNode;
}

const StyledHeading = styled(Box)(() => ({
  padding: "var(--spacing-medium)",
  backgroundColor: "var(--color-neutral-light)",
  "@media (min-width: 768px)": {
    padding: "var(--spacing-large)",
  },
}));

const Heading = ({ title, children }: HeadingProps) => {
  return (
    <StyledHeading>
      <Typography
        variant="h1"
        component="h1"
        sx={{ color: "var(--color-text)" }}
      >
        {title}
      </Typography>
      {children}
    </StyledHeading>
  );
};

export default Heading;
