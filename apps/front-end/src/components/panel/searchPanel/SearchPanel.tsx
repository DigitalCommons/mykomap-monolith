import Heading from "../heading/Heading";
import ContentPanel from "../contentPanel/ContentPanel";
import SelectBox from "../../common/selectBox/SelectBox";
import SearchBox from "./searchBox/SearchBox";
import Typography from "@mui/material/Typography";
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
import { useState } from "react";
import type { SelectChangeEvent } from "@mui/material";
import { selectTotalItemsCount } from "../../map/mapSlice";

const SearchPanel = () => {
  const dispatch = useAppDispatch();
  const submittedText = useAppSelector(selectText);
  const filterOptions = useAppSelector(selectFilterOptions);
  const visibleIndexes = useAppSelector(selectVisibleIndexes);
  const isFilterActive = useAppSelector(selectIsFilterActive);
  const totalItemsCount = useAppSelector(selectTotalItemsCount);
  const [currentText, setCurrentText] = useState(submittedText);

  const resultCount = isFilterActive ? visibleIndexes.length : totalItemsCount;

  const onSearchChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setCurrentText(e.currentTarget.value);
  };

  const onFilterChange = (e: SelectChangeEvent<string>, propId: string) => {
    console.log(`Set filter for ${propId} to ${e.target.value}`);
    dispatch(setFilterValue({ id: propId, value: e.target.value }));
    dispatch(performSearch());
  };

  const onSubmit = () => {
    console.log(`Searching for '${submittedText}'`);
    dispatch(setText(currentText));
    dispatch(performSearch());
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
      <Heading title="Search">
        <SearchBox
          value={currentText}
          onChange={onSearchChange}
          onSubmit={onSubmit}
          clearSearch={onClear}
        />
      </Heading>
      <ContentPanel>
        <Typography variant="h4" component="h4">
          {resultCount}{" "}
          {isFilterActive ? "matching results" : "directory entries"}
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
