import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import StandardButton from "../../common/standardButton/StandardButton";
import { useAppDispatch } from "../../../app/hooks";
import { clearSearch } from "../searchPanel/searchSlice";

const StyledButtonContainer = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  position: "sticky",
  padding: "var(--spacing-medium)",
  backgroundColor: "#fff",
  boxShadow: "0 0 20px rgba(0, 0, 0, 0.16)",
  margin: 0,
  "& div": {
    width: "50%",
    display: "flex",
    justifyContent: "center",
  },
  "@media (min-width: 897px)": {
    display: "none",
  },
}));

interface ApplyFiltersProps {
  buttonText: string;
  disabled: boolean;
  buttonAction: () => void;
}

const ApplyFilters = ({
  buttonText,
  buttonAction,
  disabled,
}: ApplyFiltersProps) => {
  const dispatch = useAppDispatch();

  const handleResetFilters = () => {
    dispatch(clearSearch());
  };

  return (
    <StyledButtonContainer>
      <div>
        <StandardButton
          variant="outlined"
          buttonAction={handleResetFilters}
          disabled={disabled}
        >
          Reset Filters
        </StandardButton>
      </div>
      <div>
        <StandardButton buttonAction={buttonAction} disabled={disabled}>
          {buttonText}
        </StandardButton>
      </div>
    </StyledButtonContainer>
  );
};

export default ApplyFilters;
