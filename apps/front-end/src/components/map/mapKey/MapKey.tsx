import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import { Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { selectIsMapKeyOpen, toggleMapKey } from "../mapSlice";
import {
  selectCurrentLanguage,
  selectCustomMarkers,
  selectItemProps,
  selectMarkerIcons,
  selectShowMapKey,
  selectVocabs,
} from "../../../app/configSlice";
import { getMarkerLabelsByIconIndex } from "./getMarkerLabelsByIconIndex";

type MapKeyEntry = {
  id: string;
  label: string;
  iconSrc?: string;
  colour?: string;
};

const StyledMapKeyContainer = styled(Box)(() => ({
  width: "fit-content",
  position: "absolute",
  top: 10,
  left: 10,
  zIndex: 2,
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: 10,
  pointerEvents: "none",
  "@media (min-width: 768px)": {
    top: 55,
    right: 63,
    left: "auto",
    alignItems: "flex-end",
  },
}));

const StyledMapKeyButton = styled(Button)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  padding: "var(--spacing-small) var(--spacing-medium)",
  borderRadius: "var(--border-radius-small)",
  backgroundColor: theme.palette.secondary.light,
  color: "#fff",
  textTransform: "none",
  fontWeight: "var(--font-weight-medium)",
  fontSize: "var(--font-size-small)",
  pointerEvents: "auto",
}));

const StyledMapKey = styled(Paper)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  padding: "var(--spacing-small) !important",
  maxWidth: "var(--panel-width-desktop)",
  margin: "0 auto",
  borderRadius: "var(--border-radius-small)",
  "@media (min-width: 768px)": {
    padding: "var(--spacing-large) 0",
  },
}));

const MapKeyButton = ({
  onClick,
  isOpen,
}: {
  onClick: () => void;
  isOpen: boolean;
}) => {
  const isMedium = useMediaQuery("(min-width: 768px)");

  return (
    <StyledMapKeyButton
      onClick={onClick}
      aria-controls="map-key"
      aria-expanded={isOpen}
    >
      <FormatListBulletedIcon /> {isMedium && "Map"} Key
    </StyledMapKeyButton>
  );
};

const MapKeyItem = ({
  iconSrc,
  label,
  colour,
}: {
  iconSrc?: string;
  label: string;
  colour?: string;
}) => {
  return (
    <Box
      component="li"
      display="flex"
      alignItems="center"
      gap={1}
      sx={{ listStyle: "none" }}
    >
      <Box
        sx={{
          height: 30,
          bgcolor: iconSrc ? "transparent" : colour || "primary.main",
          overflow: "hidden",
          display: "grid",
          placeItems: "center",
          flex: "0 0 auto",
        }}
      >
        {iconSrc ? (
          <Box component="img" src={iconSrc} alt="" sx={{ height: 30 }} />
        ) : null}
      </Box>

      <Box
        sx={{
          minWidth: 0,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          color: colour || "text.primary",
        }}
      >
        {label}
      </Box>
    </Box>
  );
};

const MapKey = () => {
  const mapKeyOpen = useAppSelector(selectIsMapKeyOpen);
  const dispatch = useAppDispatch();

  const markerIcons = useAppSelector(selectMarkerIcons);
  const customMarkers = useAppSelector(selectCustomMarkers);
  const itemProps = useAppSelector(selectItemProps);
  const vocabs = useAppSelector(selectVocabs);
  const currentLanguage = useAppSelector(selectCurrentLanguage);
  const showMapKey = useAppSelector(selectShowMapKey);

  if (!showMapKey || !customMarkers || !markerIcons?.length) {
    return null;
  }

  const handleToggleMapKey = () => {
    dispatch(toggleMapKey());
  };

  const markerLabelsByIconIndex = getMarkerLabelsByIconIndex({
    customMarkers,
    itemProps,
    vocabs,
    currentLanguage,
  });

  // Keep the original icon index so it stays aligned with termsToIconIndex derived labels.
  // Also exclude the default marker from the key.
  const entries: MapKeyEntry[] = markerIcons.flatMap(
    (iconName: string, iconIndex: number) =>
      iconName === "default"
        ? []
        : [
            {
              id: `m${iconIndex}`,
              label: markerLabelsByIconIndex[iconIndex] ?? iconName,
              iconSrc: `./assets/markers/${iconName}.png`,
            },
          ],
  );

  if (!entries.length) {
    return null;
  }

  return (
    <StyledMapKeyContainer>
      <MapKeyButton onClick={handleToggleMapKey} isOpen={mapKeyOpen} />

      {mapKeyOpen && (
        <StyledMapKey
          elevation={4}
          id="map-key"
          aria-label="Map Key"
          role="region"
        >
          <Stack
            component="ul"
            spacing={2}
            padding={2}
            sx={{ m: 0, listStyle: "none" }}
          >
            {entries.map((entry) => (
              <MapKeyItem
                key={entry.id}
                iconSrc={entry.iconSrc}
                label={entry.label}
                colour={entry.colour}
              />
            ))}
          </Stack>
        </StyledMapKey>
      )}
    </StyledMapKeyContainer>
  );
};

export default MapKey;
