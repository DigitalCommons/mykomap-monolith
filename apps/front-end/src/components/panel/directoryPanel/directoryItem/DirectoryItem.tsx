import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";

interface DirectoryItemProps {
  id: string;
  name: string;
  onClick?: (e: React.MouseEvent) => void; // for storybook testing
}

const StyledButton = styled(Button)(() => ({
  width: "100%",
  padding: "var(--spacing-small) var(--spacing-medium)",
  display: "block",
  fontSize: "var(--font-size-medium)",
  fontWeight: "var(--font-weight-medium)",
  textDecoration: "none",
  textAlign: "left",
  color: "var(--color-text)",
  backgroundColor: "transparent",
  borderRadius: 0,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "var(--color-neutral-light)",
  },
  "@media (min-width: 768px)": {
    padding: "var(--spacing-small) var(--spacing-large)",
  },
}));

const DirectoryItem = ({ id, name, onClick }: DirectoryItemProps) => {
  const handleClick = (e: React.MouseEvent) => {
    console.log(`Clicked ${name}`);
    if (onClick) onClick(e); // Optional for storybook testing
  };

  return (
    <ListItem key={id}>
      <StyledButton role="button" onClick={handleClick}>
        {name}
      </StyledButton>
    </ListItem>
  );
};

export default DirectoryItem;
