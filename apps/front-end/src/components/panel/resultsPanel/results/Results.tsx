import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import Pagination from "@mui/material/Pagination";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import ResultItem from "./resultItem/ResultItem";
import { useAppDispatch, useAppSelector } from "../../../../app/hooks";
import {
  closePanel,
  closeResultsPanel,
  selectResults,
  selectResultsPage,
  populateSearchResults,
  setSelectedTab,
} from "../../panelSlice";
import { openPopup } from "../../../popup/popupSlice";
import { RESULTS_PER_PAGE } from "../../panelSlice";
import {
  selectIsFilterActive,
  selectVisibleIndexes,
} from "../../searchPanel/searchSlice";
import { selectTotalItemsCount } from "../../../map/mapSlice";
import { useMediaQuery } from "@mui/material";

const StyledResults = styled(Box)(() => ({
  width: "100%",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  overflow: "auto",
  padding: "var(--spacing-medium) 0",
  maxWidth: "var(--panel-width-desktop)",
  margin: "0 auto",
  "@media (min-width: 768px)": {
    padding: "0 0 var(--spacing-large) 0",
  },
}));

const StyledPageNav = styled(Box)(()=>({
  padding: "var(--spacing-medium)",
  width: "100%",
}));

const Results = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const results = useAppSelector(selectResults);
  const resultsPage = useAppSelector(selectResultsPage);
  const visibleIndexes = useAppSelector(selectVisibleIndexes);
  const isFilterActive = useAppSelector(selectIsFilterActive);
  const totalItemsCount = useAppSelector(selectTotalItemsCount);
  const resultCount = isFilterActive ? visibleIndexes.length : totalItemsCount;
  const totalPages = Math.ceil(resultCount / RESULTS_PER_PAGE);

  const isMedium = useMediaQuery("(min-width: 897px)");

  const onItemClick = (itemIx: number) => {
    console.log(`Clicked item @${itemIx}`);
    dispatch(openPopup(itemIx));
    dispatch(closePanel());
    if (!isMedium) {
      dispatch(setSelectedTab(0));
      dispatch(closeResultsPanel());
    }
  };

  return (
    <>
    <Typography
        variant="h4"
        component="h4"
        sx={{
          color: "var(--color-neutral-tint)",
          padding: "0 var(--spacing-medium)",
          "@media (min-width: 768px)": {
            marginTop: "var(--spacing-large)",
            padding: "0 var(--spacing-large)",
          },
        }}
      >
        {t("matching_results", { count: resultCount })}
      </Typography>
    <StyledResults>      
      <List>
        {results.map((item, index) => (
          <ResultItem
            key={index}
            index={item.index}
            name={item.name}
            buttonAction={() => onItemClick(item.index)}
          />
        ))}
      </List>      
    </StyledResults>
    {totalPages > 1 && (
      <StyledPageNav>
        <Pagination
          count={totalPages}
          page={resultsPage + 1}
          onChange={(event, value) => {
            dispatch(populateSearchResults(value - 1));
          }}
          color="primary"
        />
        </StyledPageNav>
      )}
    </>
  );
};

export default Results;
