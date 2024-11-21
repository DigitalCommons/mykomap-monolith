import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useTranslation } from "react-i18next";
import { renderIfData } from "../../../utils/jsx-utils";

interface RightPaneProps {
  address?: string;
  website: string[];
  organisational_structure?: string;
  typology?: string;
  data_sources: string[];
}

const StyledRightPane = styled(Box)(() => ({
  backgroundColor: "var(--color-secondary)",
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  color: "#fff",
  fontSize: "var(--font-size-medium)",
  lineHeight: "var(--line-height-medium)",
  "@media (min-width: 768px)": {
    overflowY: "hidden",
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
  "& li": {
    display: "list-item",
    marginLeft: 0,
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
  organisational_structure,
  typology,
  data_sources,
}: RightPaneProps) => {
  const { t } = useTranslation();

  const splitAddress = (address?: string): string[] => {
    if (!address) return [];
    return address.split(",").map((line) => line.trim());
  };

  return renderIfData(
    <StyledRightPane>
      {renderIfData(
        <StyledTopBox>
          {splitAddress(address).map((line, index) => (
            <Typography key={index}>{line}</Typography>
          ))}
          <List sx={{ marginTop: "var(--spacing-small)" }}>
            {website.map((url) => (
              <ListItem
                key={url}
                sx={{
                  display: "list-item",
                  marginLeft: "var(--spacing-medium)",
                }}
              >
                <Link
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  sx={{
                    color: "#ffffffB3",
                    textDecoration: "underline",
                    padding: "0 !important",
                    fontSize: "var(--font-size-xsmall)",
                  }}
                >
                  {url}
                </Link>
              </ListItem>
            ))}
          </List>
        </StyledTopBox>,
        [address, ...website],
      )}
      <StyledBottomBox>
        {renderIfData(
          <Box
            sx={{
              marginBottom: "var(--spacing-medium)",
            }}
          >
            <Typography variant="h4">
              {t("organisational_structure")}
            </Typography>
            <Typography variant="body1">{organisational_structure}</Typography>
          </Box>,
          [organisational_structure],
        )}
        {renderIfData(
          <Box
            sx={{
              marginBottom: "var(--spacing-medium)",
            }}
          >
            <Typography variant="h4">{t("typology")}</Typography>
            <Typography variant="body1">{typology}</Typography>
          </Box>,
          [typology],
        )}
        {renderIfData(
          <Box>
            <Typography variant="h4">{t("data_sources")}</Typography>
            <List>
              {data_sources.map((dataSource) => (
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
          </Box>,
          data_sources,
        )}
      </StyledBottomBox>
    </StyledRightPane>,
    [address, ...website, organisational_structure, typology, ...data_sources],
  );
};

export default RightPane;
