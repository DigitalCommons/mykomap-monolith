import { useEffect, useState } from "react";
import { type SetURLSearchParams } from "react-router";
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
import ApplyFilters from "../applyFilters/ApplyFilters";

const SearchPanel = ({
  searchParams,
  setSearchParams,
}: {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
}) => {
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

  const filtersToUrl = (id: string, value: string) => {
    const filters = JSON.parse(searchParams.get("filters") || "{}");
    filters[id] = value;
    searchParams.set("filters", JSON.stringify(filters));
  };

  const onFilterChange = async (
    e: SelectChangeEvent<string>,
    propId: string,
  ) => {
    console.log(`Set filter for ${propId} to ${e.target.value}`);
    dispatch(setFilterValue({ id: propId, value: e.target.value }));
    filtersToUrl(propId, e.target.value);
    setSearchParams(searchParams);
    await dispatch(performSearch());
    if (isMedium) dispatch(openResultsPanel());
  };

  const onSubmitSearch = async () => {
    dispatch(setText(currentText));
    searchParams.set("searchText", currentText);
    setSearchParams(searchParams);
    console.log(`Searching for '${submittedText}'`);
    await dispatch(performSearch());
    if (isMedium) dispatch(openResultsPanel());
  };

  const onClear = () => {
    console.log("Clearing search");
    setCurrentText("");
    dispatch(setText(""));
    searchParams.delete("searchText");
    searchParams.delete("filters");
    setSearchParams(searchParams);
    dispatch(performSearch());
  };

  useEffect(() => {
    // This is needed to keep search box in sync with the search text e.g. if the search is cleared
    setCurrentText(submittedText);
  }, [submittedText]);

  useEffect(() => {
    const searchText = searchParams.get("searchText");

    if (searchText) {
      dispatch(setText(searchText));
      dispatch(performSearch());
    }
  }, [searchParams]);

  useEffect(() => {
    const filters = JSON.parse(searchParams.get("filters") || "");

    if (filters) {
      setTimeout(() => {
        Object.keys(filters).forEach((filterId) => {
          dispatch(setFilterValue({ id: filterId, value: filters[filterId] }));
        });
        dispatch(performSearch());
      }, 500);
    }
  }, [searchParams]);

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
            id={id}
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
