import Heading from "../heading/Heading";
import ContentPanel from "../contentPanel/ContentPanel";
import DirectoryItem from "./directoryItem/DirectoryItem";
import List from "@mui/material/List";

// Mock data
const countries = [
  { id: "1", name: "Argentina", link: "#" },
  { id: "2", name: "Australia", link: "#" },
  { id: "2", name: "Austria", link: "#" },
  { id: "4", name: "Bangladesh", link: "#" },
  { id: "5", name: "Barbados", link: "#" },
  { id: "6", name: "Belarus", link: "#" },
  { id: "7", name: "Belgium", link: "#" },
  { id: "8", name: "Bolivia", link: "#" },
  { id: "9", name: "Brazil", link: "#" },
  { id: "10", name: "Bulgaria", link: "#" },
  { id: "11", name: "Canada", link: "#" },
  { id: "12", name: "Chile", link: "#" },
  { id: "13", name: "China", link: "#" },
  { id: "14", name: "Colombia", link: "#" },
  { id: "15", name: "Costa Rica", link: "#" },
  { id: "16", name: "Côte d'Ivoire", link: "#" },
  { id: "17", name: "Curaçao", link: "#" },
  { id: "18", name: "Cyprus", link: "#" },
  { id: "19", name: "Czechia", link: "#" },
];

const DirectoryPanel = () => {
  return (
    <>
      <Heading title="Directory" />
      <ContentPanel>
        <List>
          {countries.map((country) => (
            <DirectoryItem key={country.id} {...country} link={country.link} />
          ))}
        </List>
      </ContentPanel>
    </>
  );
};

export default DirectoryPanel;
