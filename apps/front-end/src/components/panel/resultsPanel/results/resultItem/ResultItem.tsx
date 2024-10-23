import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import Link from "@mui/material/Link";

interface ResultItemProps {
  id: string;
  name: string;
  link: string;
  onClick?: (e: React.MouseEvent) => void; // for storybook testing
}

const StyledLink = styled(Link)(() => ({
  color: "#ffffffcc",
  transition: "ease-in 0.15s",
  "&:hover": {
    backgroundColor: "var(--color-secondary-light)",
    color: "#fff",
  },
}));

const ResultItems = ({id, name, link, onClick}: ResultItemProps) => {
  return (
    <ListItem key={id}>
      <StyledLink href={link} role="link" onClick={onClick}>
        {name}
      </StyledLink>
    </ListItem>
  );
};

export default ResultItems;
