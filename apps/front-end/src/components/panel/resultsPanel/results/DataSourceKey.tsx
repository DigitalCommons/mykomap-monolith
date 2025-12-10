import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import CheckIcon from "@mui/icons-material/Check";
import theme from "../../../../theme/theme";
interface DataSourceKeyProps {
  results: { data_sources?: string[] }[];
}

const StyledKeyContainer = styled(Box)(({ theme }) => ({
  width: "fit-content",
  display: "flex",
  alignItems: "center",
  marginTop: "10px",
  fontSize: "var(--font-size-small)",
  fontWeight: "var(--font-weight-normal)",
  color: "#fff",
  textTransform: "uppercase",
  border: `2px solid ${theme.palette.secondary.light}`,
  backgroundColor: theme.palette.secondary.light,
  letterSpacing: "0.1em",
  "& div": {
    display: "flex",
    alignItems: "center",
    marginLeft: "5px",
    padding: "3px 6px 3px 2px",
  },
}));

const DataSourceKey = ({ results }: DataSourceKeyProps) => {
  const hasDCSource = results.some((item) => item.data_sources?.includes("DC"));

  if (!hasDCSource) {
    return null;
  }

  return (
    <StyledKeyContainer>
      <CheckIcon
        style={{
          display: "flex",
          color: "var(--color-dc-source)",
          backgroundColor: theme.palette.secondary.main,
          alignSelf: "center",
        }}
      />{" "}
      <div>
        <img
          src="/assets/logos/dotcoop-logo-small.png"
          alt="DotCoop Logo"
          style={{
            margin: "3px 5px 0 0",
            
            height: "17px",
            width: "auto",
          }}
        />
        Verified
      </div>
    </StyledKeyContainer>
  );
};

export default DataSourceKey;
