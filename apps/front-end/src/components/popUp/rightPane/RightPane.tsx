import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

interface RightPaneProps {
  geocodedAddr?: string;
  website?: string;
  organisationalStructure?: string;
  typology?: string;
  dataSources: string[];
}

const RightPane = ({
  geocodedAddr,
  website,
  organisationalStructure,
  typology,
  dataSources,
}: RightPaneProps) => {
  return (
    <Box>
      <Box>
        <Typography variant="body1">{geocodedAddr}</Typography>
        <Typography variant="body1">{website}</Typography>
      </Box>
      <Box>
        <Box>
          <Typography variant="body1">Organisational Structure</Typography>
          <Typography variant="body1">{organisationalStructure}</Typography>
        </Box>
        <Box>
          <Typography variant="body1">Typology</Typography>
          <Typography variant="body1">{typology}</Typography>
        </Box>
        <Box>
          <Typography variant="body1">Data Sources</Typography>
          <List>
            {dataSources.map((dataSource) => (
              <ListItem key={dataSource}>
                <Link href={dataSource}>{dataSource}</Link>
              </ListItem>
            ))}
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default RightPane;
