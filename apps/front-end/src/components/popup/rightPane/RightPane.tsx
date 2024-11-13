import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

interface RightPaneProps {
  address?: string;
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
  borderRadius: "0 0 var(--border-radius-xlarge) var(--border-radius-xlarge)",
  color: "#fff",
  fontSize: "var(--font-size-medium)",
  lineHeight: "var(--line-height-medium)",
  overflowY: "hidden",
  "@media (min-width: 768px)": {
    borderRadius: "0 var(--border-radius-xlarge) var(--border-radius-xlarge) 0",
  },
}));

const StyledTopBox = styled(Box)(() => ({
  backgroundColor: "var(--color-secondary-light)",
  padding: "var(--spacing-large) var(--spacing-xlarge)",
  borderTopRightRadius: 0,
  "& p": {
    fontSize: "var(--font-size-small)",
  },
  "@media (min-width: 768px)": {
    borderTopRightRadius: "var(--border-radius-xlarge)",
  },
}));

const StyledBottomBox = styled(Box)(() => ({
  margin: "var(--spacing-large) var(--spacing-xlarge) var(--spacing-xlarge)",
  "& h4, & p, & li": {
    fontSize: "var(--font-size-small)",
  },
  "& h4": {
    color: "#ffffffB3",
    marginBottom: "var(--spacing-xsmall) !important",
  },
  "& ul": {
    listStyleType: "unset",
    margin: "unset",
    padding: "unset",
  },
  "& li": {
    display: "list-item",
    marginLeft: "var(--spacing-medium)",
  },
  "@media (min-width: 768px)": {
    overflowY: "auto",
    paddingRight: "var(--spacing-large)",
    marginRight: "var(--spacing-small)",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1)",
    "&::-webkit-scrollbar": {
      width: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0, 0, 0, 0.3)",
      borderRadius: "8px",
    },
  },
}));

const RightPane = ({
  address,
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
        {splitAddress(address).map((line, index) => (
          <Typography key={index}>{line}</Typography>
        ))}
        <Link
          sx={{
            color: "#ffffffB3",
            textDecoration: "underline",
            padding: "0 !important",
            fontSize: "var(--font-size-xsmall)",
            marginTop: "var(--spacing-medium)",
          }}
        >
          {website}
        </Link>
      </StyledTopBox>
      <StyledBottomBox>
        <Box
          sx={{
            marginBottom: "var(--spacing-medium)",
          }}
        >
          <Typography variant="h4">Organisational Structure</Typography>
          <Typography variant="body1">{organisationalStructure}</Typography>
        </Box>
        <Box
          sx={{
            marginBottom: "var(--spacing-medium)",
          }}
        >
          <Typography variant="h4">Typology</Typography>
          <Typography variant="body1">{typology}</Typography>
        </Box>
        <Box>
          <Typography variant="h4">Data Sources</Typography>
          <List>
            {dataSources.map((dataSource) => (
              <ListItem
                key={dataSource}
                sx={{
                  display: "list-item",
                  marginLeft: "var(--spacing-medium)",
                }}
              >
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
