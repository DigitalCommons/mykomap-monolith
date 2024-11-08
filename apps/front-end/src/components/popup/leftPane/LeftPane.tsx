import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";

interface LeftPaneProps {
  name: string;
  primaryActivity?: string;
  description?: string;
  dcDomains?: string[];
}

const StyledLeftPane = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  margin: "var(--spacing-large)",
  "@media (min-width: 768px)": {
    width: "70%",
    flexDirection: "column",
    margin:
      "var(--spacing-large) 0 var(--spacing-xlarge) var(--spacing-xlarge)",
    overflowY: "hidden",
  },
}));

const StyledHeaderContainer = styled(Box)(() => ({
  // position: "sticky",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "0 0 var(--spacing-medium) 0",
  backgroundColor: "#ffffff",
  top: 0,
  left: 0,
  "& h1": {
    fontSize: "var(--font-size-xxlarge)",
    color: "var(--color-primary)",
  },
  "@media (min-width: 768px)": {
    position: "sticky",
    padding: "0 var(--spacing-xlarge) var(--spacing-large) 0",
    "& h1": {
      fontSize: "26px",
    },
  },
}));

const StyledContentContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  // overflowY: "auto",
  whiteSpace: "pre-line",
  paddingRight: 0,
  marginRight: 0,
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
  "& h4": {
    fontSize: "var(--font-size-small)",
    color: "var(--color-primary)",
    marginBottom: "var(--spacing-xsmall)",
  },
  "& p": {
    fontSize: "var(--font-size-small)",
  },
  "@media (min-width: 768px)": {
    overflowY: "auto",
    paddingRight: "var(--spacing-large)",
    marginRight: "var(--spacing-small)",
  },
}));

const LeftPane = ({
  name,
  primaryActivity,
  description,
  dcDomains,
}: LeftPaneProps) => {
  return (
    <StyledLeftPane>
      <StyledHeaderContainer>
        <Typography variant="h1">{name}</Typography>
      </StyledHeaderContainer>
      <StyledContentContainer>
        <Box>
          <Typography variant="h4">Primary Activity</Typography>
          <Typography
            variant="body1"
            sx={{
              marginBottom: "var(--spacing-medium)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            {primaryActivity}
          </Typography>
        </Box>
        <Typography variant="body1">{description}</Typography>
        <Box>
          <Typography
            variant="h4"
            sx={{
              marginBottom: "var(--spacing-xsmall) !important",
              marginTop: "var(--spacing-large)",
            }}
          >
            Domains
          </Typography>
          <List>
            {dcDomains?.map((dcDomain) => (
              <ListItem key={dcDomain}>
                <Typography variant="body1">
                  <Link
                    href={`https://${dcDomain}`}
                    sx={{
                      color: "var(--color-text)",
                      textDecoration: "underline",
                      padding: "0 !important",
                      fontSize: "var(--font-size-xsmall)",
                    }}
                  >
                    {dcDomain}
                  </Link>
                </Typography>
              </ListItem>
            ))}
          </List>
        </Box>
      </StyledContentContainer>
    </StyledLeftPane>
  );
};

export default LeftPane;