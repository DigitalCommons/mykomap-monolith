import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import theme from "../../../../theme/theme";

interface DotCoopVerifiedProps {
  dataSources?: string[];
}

const StyledVerifiedBadge = styled(Box)(({ theme }) => ({
  width: "fit-content",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  marginTop: "10px",
  fontSize: "11px",
  fontWeight: "var(--font-weight-normal)",
  color: "#fff",
  textTransform: "uppercase",
  border: `2px solid ${theme.palette.secondary.light}`,
  backgroundColor: theme.palette.secondary.light,
  padding: "8px",
  letterSpacing: "0.1em",
  // "& div": {
  //   display: "flex",
  //   alignItems: "center",
  //   marginLeft: "5px",
  //   padding: "3px 6px 3px 2px",
  // },
}));

const DotCoopVerified = ({ dataSources }: DotCoopVerifiedProps) => {
  const hasDotCooperation = dataSources?.includes("DotCooperation");

  if (!hasDotCooperation) {
    return null;
  }

  return (
    <StyledVerifiedBadge>
      <div>
        <img
          src="/assets/logos/dotcoop-logo-small.png"
          alt="DotCoop Logo"
        />
        <div>
          Verified
        </div>
      </div>
    </StyledVerifiedBadge>
  );
};

export default DotCoopVerified;
