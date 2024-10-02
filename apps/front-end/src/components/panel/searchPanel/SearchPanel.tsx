import Heading from "../heading/Heading";
import ContentPanel from "../contentPanel/ContentPanel";
import SelectBox from "../../common/selectBox/SelectBox";
import { selectOptions } from "@testing-library/user-event/dist/cjs/utility/selectOptions.js";
import Typography from "@mui/material/Typography";

const SearchPanel = () => {

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    console.log(e.target.value);
  };

  return (
    <>
      <Heading title="Search">search box</Heading>
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
    </>
  );
};

export default SearchPanel;
