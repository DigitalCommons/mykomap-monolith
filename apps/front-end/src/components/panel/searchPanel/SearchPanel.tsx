import Heading from "../heading/Heading";
import ContentPanel from "../contentPanel/ContentPanel";
import SelectBox from "../../common/selectBox/SelectBox";
import SearchBox from "./searchBox/SearchBox";
import Typography from "@mui/material/Typography";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectText, setText, performSearch } from "./searchSlice";
import { useState } from "react";
import { SelectChangeEvent } from "@mui/material";

const SearchPanel = () => {
  const dispatch = useAppDispatch();
  const submittedText = useAppSelector(selectText);
  const [currentText, setCurrentText] = useState(submittedText);

  const onSearchChange = (e: React.FormEvent<HTMLInputElement>): void => {
    setCurrentText(e.currentTarget.value);
  };

  const onFilterChange = (e: SelectChangeEvent<string>) => {
    console.log(`Set filter to ${e.target.value}`);
  };

  const onSubmit = () => {
    console.log(`Searching for '${submittedText}'`);
    dispatch(setText(currentText));
    dispatch(performSearch());
  };

  return (
    <form className="mx-auto max-w-md" onSubmit={onSubmit}>
      <Heading title="Search">
        <SearchBox
          value={currentText}
          onChange={onSearchChange}
          onSubmit={onSubmit}
        />
      </Heading>
      <ContentPanel>
        <Typography variant="h4" component="h4">
          X matching results
        </Typography>
        <SelectBox
          label="Search by"
          onChange={onFilterChange}
          options={[
            { value: "any", label: "- Any -" },
            { value: "name", label: "Name" },
            { value: "address", label: "Address" },
            { value: "phone", label: "Phone" },
          ]}
          value="any"
        />
      </ContentPanel>
    </form>
  );
};

export default SearchPanel;
