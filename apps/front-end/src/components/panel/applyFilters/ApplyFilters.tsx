import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import StandardButton from "../../common/standardButton/StandardButton";

const StyledButtonContainer = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  justifyContent: "center",
  position: "sticky",
  padding: "var(--spacing-medium)",
  backgroundColor: "#fff",
  boxShadow: "0 0 20px rgba(0, 0, 0, 0.16)",
  margin: 0,
  "@media (min-width: 897px)": {
    display: "none",
  },
}));

interface ApplyFiltersProps {
  buttonText: string;
  disabled: boolean;
  buttonAction: () => void;
}

const ApplyFilters = ({buttonText, buttonAction, disabled}: ApplyFiltersProps) => {
  return (
    <StyledButtonContainer>
      <StandardButton
        buttonAction={buttonAction}
        disabled={disabled}
      >
        {buttonText}
      </StandardButton>
    </StyledButtonContainer>
  );
};

export default ApplyFilters;
