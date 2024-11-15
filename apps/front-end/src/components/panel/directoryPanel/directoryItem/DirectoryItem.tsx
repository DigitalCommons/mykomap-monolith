import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { useAppDispatch } from "../../../../app/hooks";
import { performSearch, setFilterValue } from "../../searchPanel/searchSlice";

interface DirectoryItemProps {
  propId: string;
  value: string;
  label: string;
  active: boolean;
  onClick?: (e: React.MouseEvent) => void; // for storybook testing
}

/** Passing active as a boolean gives a React error so just pass as a number 0 or 1. */
const StyledButton = styled(Button)(({ active }: { active: number }) => ({
  width: "100%",
  padding: "var(--spacing-small) var(--spacing-medium)",
  display: "block",
  fontSize: "var(--font-size-medium)",
  fontWeight: "var(--font-weight-medium)",
  textDecoration: "none",
  textAlign: "left",
  color: active ? "var(--color-primary)" : "var(--color-text)",
  backgroundColor: "transparent",
  borderRadius: 0,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "var(--color-neutral-light)",
  },
  "@media (min-width: 768px)": {
    padding: "var(--spacing-small) var(--spacing-large)",
  },
}));

const DirectoryItem = ({
  propId,
  value,
  label,
  active,
  onClick,
}: DirectoryItemProps) => {
  const dispatch = useAppDispatch();

  const handleClick = (e: React.MouseEvent) => {
    console.log(`Clicked ${value}`);
    dispatch(setFilterValue({ id: propId, value }));
    dispatch(performSearch());
  };

  return (
    <ListItem>
      <StyledButton role="button" active={+active} onClick={handleClick}>
        {label}
      </StyledButton>
    </ListItem>
  );
};

export default DirectoryItem;
