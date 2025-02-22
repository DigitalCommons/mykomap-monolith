import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

interface ResultItemProps {
  index: number;
  name: string;
  buttonAction?: (e: React.MouseEvent) => void; // for storybook testing
}

const StyledButton = styled(Button)(() => ({
  width: "100%",
  padding: "var(--spacing-small) var(--spacing-medium)",
  display: "block",
  fontSize: "var(--font-size-medium)",
  fontWeight: "var(--font-weight-medium)",
  textDecoration: "none",
  textAlign: "left",
  backgroundColor: "transparent",
  borderRadius: 0,
  boxShadow: "none",
  color: "#ffffffcc",
  transition: "ease-in 0.15s",
  "&:hover": {
    backgroundColor: "var(--color-secondary-light)",
    color: "#fff",
  },
  "@media (min-width: 768px)": {
    padding: "var(--spacing-small) var(--spacing-large)",
  },
}));

const ResultItems = ({ index, name, buttonAction }: ResultItemProps) => {
  return (
    <ListItem>
      <StyledButton role="button" onClick={buttonAction}>
        {name}
      </StyledButton>
    </ListItem>
  );
};

export default ResultItems;
