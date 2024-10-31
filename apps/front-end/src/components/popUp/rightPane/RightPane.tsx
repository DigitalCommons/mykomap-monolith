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

const StyledRightPane = styled(Box)(() => ({
  backgroundColor: "var(--color-secondary)",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  borderRadius: "0 var(--border-radius-xlarge) var(--border-radius-xlarge) 0",
  color: "#fff",
  fontSize: "var(--font-size-medium)",
  lineHeight: "var(--line-height-medium)",
}));

const StyledTopBox = styled(Box)(() => ({
  backgroundColor: "var(--color-secondary-light)",
  padding: "var(--spacing-xlarge) var(--spacing-xxlarge)",
  borderTopRightRadius: "var(--border-radius-xlarge)",
}));

const StyledBottomBox = styled(Box)(() => ({
  padding: "var(--spacing-xxlarge) var(--spacing-xxlarge)",
}));

const RightPane = ({
  geocodedAddr,
  website,
  organisationalStructure,
  typology,
  dataSources,
}: RightPaneProps) => {
  const splitAddress = (address?: string): string[] => {
    if (!address) return [];
    return address.split(",").map((line) => line.trim());
  };

  return (
    <StyledRightPane>
      <StyledTopBox>
        {splitAddress(geocodedAddr).map((line, index) => (
          <Typography key={index} variant="body1">
            {line}
          </Typography>
        ))}
        <Typography variant="body1">{website}</Typography>
      </StyledTopBox>
      <StyledBottomBox>
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
      </StyledBottomBox>
    </StyledRightPane>
  );
};

export default RightPane;
