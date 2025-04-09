import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { decode } from "html-entities";
import { renderIfData } from "../../../utils/jsx-utils";

interface LeftPaneProps {
  name: string;
  category: string[];
  // primary_activity?: string;
  description?: string;
  // dc_domains: string[];
  hasLocation: boolean;
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

const StyledDomainListsContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
}));

const LeftPane = ({
  name,
  category,
  // primary_activity,
  description,
  // dc_domains,
  hasLocation,
}: LeftPaneProps) => {
  const { t } = useTranslation();
  const cleanDescription = decode(
    description?.replace(/<[^<>]+(>)/g, ""), // remove HTML tags
  )?.trim();

  // const MAX_DOMAIN_LENGTH = 25;
  // const DOMAINS_SINGLE_COlUMN = 9;

  // //split into 2 columns if more than 10 domains and there's room to render
  // const dcDomains =
  //   dc_domains.length > DOMAINS_SINGLE_COlUMN && window.innerWidth >= 400
  //     ? [
  //         dc_domains.slice(0, Math.ceil(dc_domains.length / 2)),
  //         dc_domains.slice(Math.ceil(dc_domains.length / 2)),
  //       ]
  //     : [dc_domains];

  return (
    <StyledLeftPane>
      <StyledHeaderContainer>
        <Typography variant="h1" sx={{ overflowWrap: "break-word" }}>
          {name}
        </Typography>
        {!hasLocation && (
          <Typography variant="subtitle2">
            {t("no_location_available")}
          </Typography>
        )}
      </StyledHeaderContainer>
      <StyledContentContainer>
        {renderIfData(
          <Box
            sx={{
              marginBottom: "var(--spacing-medium)",
            }}
          >
            <Typography variant="h4">{t("category")}</Typography>
            {category.map((c) => (
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "var(--font-weight-medium)",
                  whiteSpace: "pre-wrap",
                }}
              >
                {c}
              </Typography>
            ))}
          </Box>,
          [...category],
        )}
        <Typography variant="body1">{cleanDescription}</Typography>
        {/* {renderIfData(
          <Box>
            <Typography
              variant="h4"
              sx={{
                marginBottom: "var(--spacing-xsmall) !important",
                marginTop: "var(--spacing-large)",
              }}
            >
              {t("domains")}
            </Typography>
            <StyledDomainListsContainer>
              {dcDomains.map((domains) => (
                <List>
                  {domains?.map((dcDomain) => (
                    <ListItem key={dcDomain}>
                      <Typography variant="body1">
                        <Link
                          href={`https://${dcDomain}`}
                          target="_blank"
                          rel="noreferrer"
                          sx={{
                            color: "var(--color-text)",
                            textDecoration: "underline",
                            padding: "0 !important",
                            fontSize: "var(--font-size-xsmall)",
                          }}
                        >
                          {dcDomain.length > MAX_DOMAIN_LENGTH &&
                          dc_domains.length > DOMAINS_SINGLE_COlUMN
                            ? dcDomain.slice(0, MAX_DOMAIN_LENGTH - 5) + "(...)"
                            : dcDomain}
                        </Link>
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              ))}
            </StyledDomainListsContainer>
          </Box>,
          dc_domains,
        )} */}
      </StyledContentContainer>
    </StyledLeftPane>
  );
};

export default LeftPane;
