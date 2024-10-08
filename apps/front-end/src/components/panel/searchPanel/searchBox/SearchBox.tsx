import React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import { IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";

const StyledSearchBox = styled(OutlinedInput)(() => ({
  width: "100%",
  borderRadius: "var(--border-radius-small)",
  backgroundColor: "#fff",
  color: "var(--color-text)",
  marginTop: "var(--spacing-medium)",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "transparent",
  },
  "& .MuiOutlinedInput-input": {
    padding:
      "var(--spacing-small) var(--spacing-medium) var(--spacing-small) var(--spacing-small)",
    fontSize: "var(--font-size-medium)",
  },
  "& .MuiInputAdornment-root": {
    color: "#fff",
    marginLeft: 0,
  },
  "& .MuiIconButton-root": {
    color: "var(--color-text)",
  },
}));

interface SearchBoxProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

const SearchBox = ({ value, onChange, onSubmit }: SearchBoxProps) => {
  return (
    <StyledSearchBox
      id="search-input"
      value={value}
      onChange={onChange}
      onKeyUp={(event) => {
        if (event.key === "Enter") onSubmit(event);
      }}
      autoComplete="off"
      placeholder="Search for initiatives..."
      startAdornment={
        <InputAdornment position="end">
          <IconButton aria-label="search-button" disableRipple>
            <SearchIcon />
          </IconButton>
        </InputAdornment>
      }
    />
  );
};

export default SearchBox;
