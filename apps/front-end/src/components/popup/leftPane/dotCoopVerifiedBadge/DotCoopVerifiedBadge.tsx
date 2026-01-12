import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import theme from "../../../../theme/theme";

const StyledVerifiedBadge = styled(Box)(({ theme }) => ({
  width: "fit-content",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  fontSize: "11px",
  fontWeight: "var(--font-weight-normal)",
  color: "#fff",
  textTransform: "uppercase",
  backgroundColor: theme.palette.secondary.light,
  padding: "8px 8px 5px",
  letterSpacing: "0.1em",
}));

const DotCoopVerifiedBadge = () => {
  return (
    <StyledVerifiedBadge role="status" aria-label="DotCoop Verified">
      <div>
        <img
          src="/assets/logos/dotcoop-logo-small.png"
          alt=""
          aria-hidden="true"
        />
        <div>Verified</div>
      </div>
    </StyledVerifiedBadge>
  );
};

export default DotCoopVerifiedBadge;
