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
        <Link
          sx={{
            color: "#ffffffB3",
            textDecoration: "underline",
            padding: "0 !important",
            fontSize: "var(--font-size-small)",
            marginTop: "var(--spacing-medium)",
          }}
        >
          {website}
        </Link>
      </StyledTopBox>
      <StyledBottomBox>
        <Box
          sx={{
            marginBottom: "var(--spacing-large)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#ffffffB3",
              marginBottom: "var(--spacing-xsmall) !important",
            }}
          >
            Organisational Structure
          </Typography>
          <Typography variant="body1">{organisationalStructure}</Typography>
        </Box>
        <Box
          sx={{
            marginBottom: "var(--spacing-large)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#ffffffB3",
              marginBottom: "var(--spacing-xsmall) !important",
            }}
          >
            Typology
          </Typography>
          <Typography variant="body1">{typology}</Typography>
        </Box>
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: "#ffffffB3",
              marginBottom: "var(--spacing-xsmall) !important",
            }}
          >
            Data Sources
          </Typography>
          <List
            sx={{ listStyleType: "unset", margin: "unset", padding: "unset" }}
          >
            {dataSources.map((dataSource) => (
              <ListItem key={dataSource} sx={{ display: "list-item", marginLeft: "var(--spacing-medium)" }}>
                {dataSource}
              </ListItem>
            ))}
          </List>
        </Box>
      </StyledBottomBox>
    </StyledRightPane>
  );
};

export default RightPane;
