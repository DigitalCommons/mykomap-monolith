import ListItem from "@mui/material/ListItem";
import { styled } from "@mui/material/styles";
import Button from "@mui/material/Button";
import { useAppDispatch } from "../../../../app/hooks";
import { performSearchFromQuery } from "../../searchPanel/searchSlice";
import { openResultsPanel } from "../../panelSlice";
import icons from "../../../map/markers";

interface DirectoryItemProps {
  propId: string;
  value: string;
  label: string;
  active: boolean;
  resultsTotal: number;
  onClick?: (e: React.MouseEvent) => void; // for storybook testing
  iconIndex?: number;
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
  whiteSpace: "pre-wrap",
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

const IconImage = styled("img")(() => ({
  height: 16,
  flexshrink: 0,
}));

const DirectoryItem = ({
  propId,
  value,
  label,
  active,
  resultsTotal,
  onClick,
}: DirectoryItemProps) => {
  const dispatch = useAppDispatch();

  const handleClick = async (e: React.MouseEvent) => {
    console.log(`Clicked ${value}`);
    await dispatch(
      performSearchFromQuery({ filter: [`${propId}:${value}`], text: "" }),
    );
    dispatch(openResultsPanel());
  };

  // Get icon based on index
  const icon = useMemo(() => {
    if (
      iconIndex !== undefined &&
      iconIndex >= 0 &&
      iconIndex < markers.length
    ) {
      return markers[iconIndex];
    }
    return null;
  }, []);

  return (
    <ListItem>
      <StyledButton
        role="button"
        active={+active}
        disabled={!resultsTotal}
        onClick={handleClick}
      >
        {icon && (
          <IconImage src={icon} alt={`${label} icon`} aria-hidden="true" />
        )}
        {label} ({resultsTotal ? resultsTotal : 0})
      </StyledButton>
    </ListItem>
  );
};

export default DirectoryItem;
