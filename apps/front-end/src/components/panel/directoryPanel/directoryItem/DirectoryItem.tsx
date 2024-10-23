import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import Link from "@mui/material/Link";

interface DirectoryItemProps {
  id: string;
  name: string;
  link: string;
  onClick?: (e: React.MouseEvent) => void; // for storybook testing
}

const StyledLink = styled(Link)(() => ({
  color: "var(--color-text)",
  "&:hover": {
    backgroundColor: "var(--color-neutral-light)",
  },
}));

const DirectoryItem = ({ id, name, link, onClick }: DirectoryItemProps) => {
  return (
    <ListItem key={id}>
      <StyledLink href={link} role="link" onClick={onClick}>{name}</StyledLink>
    </ListItem>
  );
};

export default DirectoryItem;
