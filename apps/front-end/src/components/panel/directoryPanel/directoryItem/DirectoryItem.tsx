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
  isSubCategory: boolean;
}

/** Passing active as a boolean gives a React error so just pass as a number 0 or 1. */
const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== "isSubCategory" && prop !== "active",
})<{
  active: number;
  isSubCategory: boolean;
}>(({ active, isSubCategory }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: "var(--spacing-small)",
  width: "100%",
  padding: isSubCategory
    ? "var(--spacing-small) calc(var(--spacing-medium) + 20px)"
    : "var(--spacing-small) var(--spacing-medium)",
  columnGap: isSubCategory ? "var(--spacing-small)" : "12px",
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
    padding: isSubCategory
      ? "var(--spacing-small) calc(var(--spacing-large) + 20px)"
      : "var(--spacing-small) var(--spacing-large)",
  },
}));

const StyledIconImage = styled("img")(() => ({
  height: 16,
  width: 16,
  flexShrink: 0,
}));

const StyledSubCategoryBullet = styled("span")(() => ({
  width: 16,
  height: 16,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  position: "relative",
  "&::before": {
    content: '"\\2022"',
    display: "block",
  },
}));

const DirectoryItem = ({
  propId,
  value,
  label,
  active,
  resultsTotal,
  onClick,
  iconSrc,
  isSubCategory,
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
        isSubCategory={isSubCategory}
        disabled={!resultsTotal}
        onClick={handleClick}
      >
        {isSubCategory ? (
          <StyledSubCategoryBullet aria-hidden="true" />
        ) : iconSrc ? (
          <StyledIconImage src={iconSrc} alt={label} />
        ) : null}
        {label} ({resultsTotal ? resultsTotal : 0})
      </StyledButton>
    </ListItem>
  );
};

export default DirectoryItem;
