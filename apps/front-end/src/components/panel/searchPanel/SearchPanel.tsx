import { useState } from "react";
import type { SelectChangeEvent } from "@mui/material";
import { useTranslation } from "react-i18next";
import Heading from "../heading/Heading";
import ContentPanel from "../contentPanel/ContentPanel";
import SelectBox from "../../common/selectBox/SelectBox";
import SearchBox from "./searchBox/SearchBox";
import StandardButton from "../../common/standardButton/StandardButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  selectText,
  setText,
  performSearch,
  selectFilterOptions,
  setFilterValue,
  selectVisibleIndexes,
  selectIsFilterActive,
} from "./searchSlice";
import { selectTotalItemsCount } from "../../map/mapSlice";
import { openResultsPanel } from "../panelSlice";

const StyledButtonContainer = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  position: "sticky",
  padding: "var(--spacing-medium)",
  backgroundColor: "rgba(255, 255, 255, 0.25) !important",
  boxShadow: "0 0 20px rgba(0, 0, 0, 0.16)",
  zIndex: 1,
  "@media (min-width: 897px)": {
    display: "none",
  },
}));

const SearchPanel = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const submittedText = useAppSelector(selectText);
  const filterOptions = useAppSelector(selectFilterOptions);
  const visibleIndexes = useAppSelector(selectVisibleIndexes);
  const isFilterActive = useAppSelector(selectIsFilterActive);
  const totalItemsCount = useAppSelector(selectTotalItemsCount);
  const [currentText, setCurrentText] = useState(submittedText);

  const isMedium = useMediaQuery("(min-width: 897px)");

  const resultCount = isFilterActive ? visibleIndexes.length : totalItemsCount;

  const onSearchChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setCurrentText(e.currentTarget.value);
  };

  const onFilterChange = (e: SelectChangeEvent<string>, propId: string) => {
    console.log(`Set filter for ${propId} to ${e.target.value}`);
    dispatch(setFilterValue({ id: propId, value: e.target.value }));
    dispatch(performSearch());
    if (isMedium) dispatch(openResultsPanel());
  };

  const onSubmit = () => {
    console.log(`Searching for '${submittedText}'`);
    dispatch(setText(currentText));
    dispatch(openResultsPanel());
  };

  const onClear = () => {
    console.log("Clearing search");
    setCurrentText("");
    dispatch(setText(""));
    dispatch(performSearch());
  };

  return (
    <form
      onSubmit={onSubmit}
      style={{ display: "flex", flexDirection: "column", overflow: "hidden" }} // Fix for search filter overflow issue
    >
      <Heading title={t("search")}>
        <SearchBox
          value={currentText}
          onChange={onSearchChange}
          onSubmit={onSubmit}
          clearSearch={onClear}
        />
      </Heading>
      <ContentPanel>
        <Typography variant="h4" component="h4">
          {isFilterActive
            ? t("matching_results", { count: resultCount })
            : t("directory_entries", { count: resultCount })}
        </Typography>
        {filterOptions.map(({ id, title, options, value }) => (
          <SelectBox
            key={`select-box-${id}`}
            label={title}
            onChange={(e) => onFilterChange(e, id)}
            options={options}
            value={value}
          />
        ))}
      </ContentPanel>
      <StyledButtonContainer>
        {!isMedium && (
          <StandardButton
            buttonAction={onSubmit}
            disabled={!currentText && !isFilterActive}
          >
            {t("apply_filters")}
          </StandardButton>
        )}
      </StyledButtonContainer>
    </form>
  );
};

export default SearchPanel;
