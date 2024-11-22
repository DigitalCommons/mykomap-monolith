import { useState } from "react";
import type { SelectChangeEvent } from "@mui/material";
import { useTranslation } from "react-i18next";
import Heading from "../heading/Heading";
import ContentPanel from "../contentPanel/ContentPanel";
import SelectBox from "../../common/selectBox/SelectBox";
import SearchBox from "./searchBox/SearchBox";
import Typography from "@mui/material/Typography";
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

  const onFilterChange = async (
    e: SelectChangeEvent<string>,
    propId: string,
  ) => {
    console.log(`Set filter for ${propId} to ${e.target.value}`);
    dispatch(setFilterValue({ id: propId, value: e.target.value }));
    await dispatch(performSearch());
    if (isMedium) dispatch(openResultsPanel());
  };

  const onSubmitSearch = async () => {
    dispatch(setText(currentText));
    console.log(`Searching for '${submittedText}'`);
    await dispatch(performSearch());
    if (isMedium) dispatch(openResultsPanel());
  };

  const onClear = () => {
    console.log("Clearing search");
    setCurrentText("");
    dispatch(setText(""));
    dispatch(performSearch());
  };

  return (
    <form
      style={{
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        paddingBottom: "80px",
      }} // Fix for search filter overflow issue
    >
      <Heading title={t("search")}>
        <SearchBox
          value={currentText}
          onChange={onSearchChange}
          onSubmit={onSubmitSearch}
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
    </form>
  );
};

export default SearchPanel;
