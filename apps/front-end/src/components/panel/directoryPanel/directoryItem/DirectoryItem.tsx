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
  isPrimaryCategory?: boolean;
}

/** Passing active as a boolean gives a React error so just pass as a number 0 or 1. */
const StyledButton = styled(Button)(({ active, isPrimaryCategory }: { active: number, isPrimaryCategory?: boolean }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "var(--spacing-small)",
  width: "100%",
  padding: isPrimaryCategory
    ? "var(--spacing-small) var(--spacing-medium)"
    : "var(--spacing-small) calc(var(--spacing-medium) + 20px)",
  // display: "block",
  fontSize: "var(--font-size-medium)",
  fontWeight: "var(--font-weight-medium)",
  textDecoration: "none",
  textAlign: "left",
  whiteSpace: "pre-wrap",
  color: active ? "var(--color-primary)" : "var(--color-text)",
  backgroundColor: "transparent",
  borderRadius: 0,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: "var(--color-neutral-light)",
  },
  "@media (min-width: 768px)": {
    padding: isPrimaryCategory
      ? "var(--spacing-small) var(--spacing-large)"
      : "var(--spacing-small) calc(var(--spacing-large) + 20px)",
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
  isPrimaryCategory,
}: DirectoryItemProps) => {
  const dispatch = useAppDispatch();

  const handleClick = async (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      return;
    }
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
        isPrimaryCategory={isPrimaryCategory}
        disabled={!resultsTotal}
        onClick={handleClick}
      >
        {iconSrc && <StyledIconImage src={iconSrc} alt={label} />}
        {label} ({resultsTotal ? resultsTotal : 0})
      </StyledButton>
    </ListItem>
  );
};

export default DirectoryItem;
