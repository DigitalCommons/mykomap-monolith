import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

const StyledAdContainer = styled("a")(() => ({
  width: "calc(100% + (2 * var(--spacing-large)))",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "stretch",
  marginTop: "auto",
  marginLeft: "calc(-1 * var(--spacing-large))",
  marginRight: "calc(-1 * var(--spacing-large))",
  marginBottom: "calc(-1 * var(--spacing-large))",
  boxSizing: "border-box",
  color: "var(--color-dc-source)",
  textAlign: "center",
  borderTop: "1px solid var(--color-neutral-tint)",
  backgroundColor: "#fff",
  borderRadius: 0,
  padding: "var(--spacing-medium) var(--spacing-medium)",
  textDecoration: "none",
  cursor: "pointer",

  "& span": {
    fontSize: "var(--font-size-xsmall) !important",
    fontWeight: "var(--font-weight-medium)",
  },

  "@media (min-width: 768px)": {
    width: "calc(100% + var(--spacing-xlarge))",
    marginLeft: "calc(-1 * var(--spacing-xlarge))",
    marginRight: 0,
    marginBottom: "calc(-1 * var(--spacing-xlarge))",
    padding: "var(--spacing-small) var(--spacing-medium)",
  },
}));

const DotCoopAd = () => {
  return (
    <StyledAdContainer
      href="https://identity.coop/register/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Become verified. Register a .coop domain (opens in new tab)"
    >
      <OpenInNewIcon
        sx={{
          verticalAlign: "middle",
          marginRight: "4px",
          fontSize: "var(--font-size-medium)",
          whiteSpace: "nowrap",
        }}
      />
      <Typography component="span">Become verified. Register a</Typography>
      <img
        src="./assets/logos/dotcoop-logo-xsmall.png"
        alt="DotCoop logo"
        style={{ verticalAlign: "middle", margin: "0 4px" }}
      />
      <Typography component="span">domain</Typography>
    </StyledAdContainer>
  );
};

export default DotCoopAd;
