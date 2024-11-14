import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import { styled } from "@mui/material/styles";
import ResultItem from "./resultItem/ResultItem";
import { useAppSelector } from "../../../../app/hooks";
import { selectVisibleIndexes } from "../../searchPanel/searchSlice";

const StyledResults = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  padding: "var(--spacing-medium) 0",
  maxWidth: "var(--panel-width-desktop)",
  margin: "0 auto",
  "@media (min-width: 768px)": {
    padding: "var(--spacing-xxlarge) 0 var(--spacing-large) 0",
  },
}));

const Results = () => {
  const visibleIndexes = useAppSelector(selectVisibleIndexes);

  const resultCount = visibleIndexes.length;

  return (
    <StyledResults>
      <Typography
        variant="h4"
        component="h4"
        sx={{
          color: "var(--color-neutral-tint)",
          padding: "0 var(--spacing-medium)",
          "@media (min-width: 768px)": {
            marginBottom: "var(--spacing-large)",
            padding: "0 var(--spacing-large)",
          },
        }}
      >
        {resultCount} matching results
      </Typography>
      <List>
        {visibleIndexes.map((index) => (
          <ResultItem
            key={index}
            id={index.toString()}
            name={index.toString()}
            buttonAction={() => console.log(`Clicked ${index}`)}
          />
        ))}
      </List>
    </StyledResults>
  );
};

export default Results;
