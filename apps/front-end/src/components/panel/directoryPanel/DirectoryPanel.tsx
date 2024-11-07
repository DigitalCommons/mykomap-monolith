import Heading from "../heading/Heading";
import DirectoryItem from "./directoryItem/DirectoryItem";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

// Mock data
const countries: { id: string; name: string }[] = [
  { id: "1", name: "Argentina" },
  { id: "2", name: "Australia" },
  { id: "3", name: "Austria" },
  { id: "4", name: "Bangladesh" },
  { id: "5", name: "Barbados" },
  { id: "6", name: "Belarus" },
  { id: "7", name: "Belgium" },
  { id: "8", name: "Bolivia" },
  { id: "9", name: "Brazil" },
  { id: "10", name: "Bulgaria" },
  { id: "11", name: "Canada" },
  { id: "12", name: "Chile" },
  { id: "13", name: "China" },
  { id: "14", name: "Colombia" },
  { id: "15", name: "Costa Rica" },
  { id: "16", name: "Côte d'Ivoire" },
  { id: "17", name: "Curaçao" },
  { id: "18", name: "Cyprus" },
  { id: "19", name: "Czechia" },
];

interface DirectoryPanelProps {
  onClick?: (e: React.MouseEvent) => void; // for storybook testing
}

const StyledDirectoryPanel = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  padding: "var(--spacing-medium) 0",
  maxWidth: "var(--panel-width-desktop)",
  margin: "0 auto",
  "@media (min-width: 768px)": {
    padding: "var(--spacing-large) 0",
  },
}));

const StyledButton = styled(Button)(() => ({
  width: "100%",
  padding: "var(--spacing-small) var(--spacing-medium)",
  display: "block",
  fontSize: "var(--font-size-medium)",
  fontWeight: "var(--font-weight-medium)",
  textDecoration: "none",
  textAlign: "left",
  color: "var(--color-primary)",
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

const DirectoryPanel = ({ onClick }: DirectoryPanelProps) => {
  const showAllEntries = () => {
    console.log("Show all entries");
  };

  return (
    <>
      <Heading title="Directory" />
      <StyledDirectoryPanel>
        <List>
          <ListItem>
            <StyledButton role="button" onClick={showAllEntries}>
              All Entries
            </StyledButton>
          </ListItem>
          {countries.map((country) => (
            <DirectoryItem key={country.id} {...country} />
          ))}
        </List>
      </StyledDirectoryPanel>
    </>
  );
};

export default DirectoryPanel;
