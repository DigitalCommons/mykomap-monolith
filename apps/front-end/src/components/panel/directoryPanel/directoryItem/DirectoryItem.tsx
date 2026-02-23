import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { useAppDispatch } from "../../../../app/hooks";
import { performSearchFromQuery } from "../../searchPanel/searchSlice";
import { openResultsPanel } from "../../panelSlice";

interface DirectoryItemProps {
  propId: string;
  value: string;
  label: string;
  active: boolean;
  resultsTotal: number;
  onClick?: (e: React.MouseEvent) => void; // for storybook testing
  iconSrc?: string;
  categoryColor?: string;
}

/** Passing active as a boolean gives a React error so just pass as a number 0 or 1. */
const StyledButton = styled(Button)(({ active, categoryColor }: { active: number; categoryColor?: string }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "var(--spacing-small)",
  width: "100%",
  padding: "var(--spacing-small) var(--spacing-medium)",
  // display: "block",
  fontSize: "var(--font-size-medium)",
  fontWeight: "var(--font-weight-medium)",
  textDecoration: "none",
  textAlign: "left",
  whiteSpace: "pre-wrap",
  color: active ? "var(--color-primary)" : categoryColor || "var(--color-text)",
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

const StyledIconImage = styled("img")(() => ({
  height: 16,
  width: 16,
  flexShrink: 0,
}));

const DirectoryItem = ({
  propId,
  value,
  label,
  active,
  resultsTotal,
  onClick,
  iconSrc,
  categoryColor,
}: DirectoryItemProps) => {
  const dispatch = useAppDispatch();

  const handleClick = async (e: React.MouseEvent) => {
    console.log(`Clicked ${value}`);
    await dispatch(
      performSearchFromQuery({ filter: [`${propId}:${value}`], text: "" }),
    );
    dispatch(openResultsPanel());
  };

  return (
    <ListItem>
      <StyledButton
        role="button"
        active={+active}
        disabled={!resultsTotal}
        onClick={handleClick}
        categoryColor={categoryColor}
      >
        {iconSrc && <StyledIconImage src={iconSrc} alt={label} />}
        {label} ({resultsTotal ? resultsTotal : 0})
      </StyledButton>
    </ListItem>
  );
};

export default DirectoryItem;
