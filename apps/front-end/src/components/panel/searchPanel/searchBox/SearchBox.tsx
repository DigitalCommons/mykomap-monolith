import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import Box from "@mui/material/Box";
import SearchIcon from "@mui/icons-material/Search";
import { styled } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import CancelIcon from "@mui/icons-material/Cancel";

const StyledSearchBox = styled(OutlinedInput)(() => ({
  width: "100%",
  borderRadius: "var(--border-radius-small)",
  backgroundColor: "#fff",
  color: "var(--color-text)",
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

const StyledIconButton = styled(IconButton)(() => ({
  height: 18,
  width: 18,
  position: "absolute",
  top: "50%",
  right: "var(--spacing-xsmall)",
  transform: "translate(-50%, -50%)",
  color: "var(--color-text)",
}));

interface SearchBoxProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  clearSearch?: () => void;
}

const SearchBox = ({
  value,
  onChange,
  onSubmit,
  clearSearch,
}: SearchBoxProps) => {
  return (
    <Box sx={{ position: "relative", marginTop: "var(--spacing-medium)" }}>
      <StyledSearchBox
        id="search-input"
        value={value}
        onChange={onChange}
        onKeyUp={(event) => {
          if (event.key === "Enter") onSubmit(event);
        }}
        autoComplete="off"
        placeholder="Search for items..."
        startAdornment={
          <InputAdornment position="end">
            <IconButton aria-label="search-button" disableRipple>
              <SearchIcon />
            </IconButton>
          </InputAdornment>
        }
      />
      {value && (
        <StyledIconButton onClick={clearSearch} aria-label="clear-search">
          <Box
            sx={{
              height: 16,
              width: 16,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#fff",
              borderRadius: "50%",
            }}
          />
          <CancelIcon
            sx={{
              height: 18,
              width: 18,
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          />
        </StyledIconButton>
      )}
    </Box>
  );
};

export default SearchBox;
