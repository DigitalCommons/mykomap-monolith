import Heading from "../heading/Heading";
import ContentPanel from "../contentPanel/ContentPanel";
import SelectBox from "../../common/selectBox/SelectBox";
import SearchBox from "./searchBox/SearchBox";
import { selectOptions } from "@testing-library/user-event/dist/cjs/utility/selectOptions.js";
import Typography from "@mui/material/Typography";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import {
  selectText,
  setText,
  performSearch,
} from "../../../features/filter/filterSlice";

const SearchPanel = () => {
  const dispatch = useAppDispatch();
  const searchText = useAppSelector(selectText);

  // onChange handler for the search input
  const onSearchChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ): void => {
    dispatch(setText(e.currentTarget.value));
  };

  // onChange handler for the select input
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    console.log(e.target.value);
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(`Searching for ${searchText}`);
    dispatch(performSearch());
  };

  return (
    <form className="mx-auto max-w-md" onSubmit={onSubmit}>
      <Heading title="Search">
        <SearchBox value={searchText} onChange={onSearchChange} />
      </Heading>
      <ContentPanel>
        <Typography variant="h4" component="h4">
          X matching results
        </Typography>
        <SelectBox
          label="Search by"
          onChange={(e) =>
            handleChange(
              e as React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
              >,
            )
          }
          options={[
            { value: "name", label: "Name" },
            { value: "address", label: "Address" },
            { value: "phone", label: "Phone" },
          ]}
          value={selectOptions.name}
        />
      </ContentPanel>
    </form>
  );
};

export default SearchPanel;
