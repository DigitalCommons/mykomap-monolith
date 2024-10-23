import Heading from "../heading/Heading";
import DirectoryItem from "./directoryItem/DirectoryItem";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

// Mock data
const countries = [
  { id: "1", name: "Argentina", link: "" },
  { id: "2", name: "Australia", link: "" },
  { id: "3", name: "Austria", link: "" },
  { id: "4", name: "Bangladesh", link: "" },
  { id: "5", name: "Barbados", link: "" },
  { id: "6", name: "Belarus", link: "" },
  { id: "7", name: "Belgium", link: "" },
  { id: "8", name: "Bolivia", link: "" },
  { id: "9", name: "Brazil", link: "" },
  { id: "10", name: "Bulgaria", link: "" },
  { id: "11", name: "Canada", link: "" },
  { id: "12", name: "Chile", link: "" },
  { id: "13", name: "China", link: "" },
  { id: "14", name: "Colombia", link: "" },
  { id: "15", name: "Costa Rica", link: "" },
  { id: "16", name: "Côte d'Ivoire", link: "" },
  { id: "17", name: "Curaçao", link: "" },
  { id: "18", name: "Cyprus", link: "" },
  { id: "19", name: "Czechia", link: "" },
];

interface DirectoryPanelProps {
  onClick?: (e: React.MouseEvent) => void; // for storybook testing
}

const StyledDirectoryPanel = styled(Box)(() => ({
  padding: "var(--spacing-medium) 0",
  maxWidth: "var(--panel-width-desktop)",
  margin: "0 auto",
  "@media (min-width: 768px)": {
    padding: "var(--spacing-large) 0",
  },
}));

const StyledLink = styled(Link)(() => ({
  color: "var(--color-primary)",
  display: "block",
  "&:hover": {
    backgroundColor: "var(--color-neutral-light)",
  },
}));

const DirectoryPanel = ({onClick}: DirectoryPanelProps) => {
  return (
    <>
      <Heading title="Directory" />
      <StyledDirectoryPanel>
        <List>
          <ListItem>
            <StyledLink href="" role="link" onClick={onClick}>
              All Entries
            </StyledLink>
          </ListItem>
          {countries.map((country) => (
            <DirectoryItem key={country.id} {...country} link={country.link} />
          ))}
        </List>
      </StyledDirectoryPanel>
    </>
  );
};

export default DirectoryPanel;
