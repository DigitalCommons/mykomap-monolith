import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";

interface LeftPaneProps {
  name: string;
  primaryActivity?: string;
  description?: string;
  dcDomains?: string[];
}

const StyledLeftPane = styled(Box)(() => ({
  width: "65%",
  padding:
    "var(--spacing-xlarge) var(--spacing-xxlarge) var(--spacing-xxlarge)",
}));

const StyledHeaderContainer = styled(Box)(() => ({
  position: "sticky",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
}));

const LeftPane = ({
  name,
  primaryActivity,
  description,
  dcDomains,
}: LeftPaneProps) => {
  return (
    <StyledLeftPane>
      <Box>
        <Typography variant="h1" sx={{ color: "var(--color-primary)" }}>
          {name}
        </Typography>
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
    </StyledLeftPane>
  );
};

export default LeftPane;
