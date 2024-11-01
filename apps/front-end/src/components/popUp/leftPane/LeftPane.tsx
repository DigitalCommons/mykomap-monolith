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
  width: "60%",
  display: "flex",
  flexDirection: "column",
  margin:
    "var(--spacing-xlarge) 0 var(--spacing-xxlarge) var(--spacing-xxlarge)",
  overflowY: "hidden",
}));

const StyledHeaderContainer = styled(Box)(() => ({
  position: "sticky",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  padding: "0 var(--spacing-xxlarge) var(--spacing-xlarge) 0",
  backgroundColor: "#fff",
  top: 0,
  left: 0,
}));

const StyledContentContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  whiteSpace: "pre-line",
  paddingRight: "var(--spacing-large)",
  marginRight: "var(--spacing-medium)",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1)",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: "10px",
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
        <Typography
          variant="h1"
          sx={{ color: "var(--color-primary)", fontSize: "28px" }}
        >
          {name}
        </Typography>
      </StyledHeaderContainer>
      <StyledContentContainer>
        <Box>
          <Typography
            variant="h4"
            sx={{ marginBottom: "var(--spacing-xsmall) !important" }}
          >
            Primary Activity
          </Typography>
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
            sx={{ marginBottom: "var(--spacing-xsmall) !important", marginTop: "var(--spacing-large)" }}
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
