import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";

interface LeftPaneProps {
  name: string;
  primaryActivity?: string;
  description?: string;
  dcDomains?: string[];
}

const LeftPane = ({
  name,
  primaryActivity,
  description,
  dcDomains,
}: LeftPaneProps) => {
  return (
    <Box>
      <Box>
        <Typography variant="h5">{name}</Typography>
        <Box>
          <Typography variant="body1">{primaryActivity}</Typography>
        </Box>
      </Box>
      <Box>
        <Typography variant="body1">{description}</Typography>
      </Box>
      <Box>
        <List>
          {dcDomains?.map((dcDomain) => (
            <ListItem key={dcDomain}>
              <Typography variant="body1">{dcDomain}</Typography>
            </ListItem>
          ))}
        </List>
      </Box>
    </Box>
  );
};

export default LeftPane;
