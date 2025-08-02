import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import LeftPane from "./leftPane/LeftPane";
import RightPane from "./rightPane/RightPane";
import { styled } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import {
  selectPopupIsOpen,
  selectPopupData,
  selectPopupIndex,
  closePopup,
} from "./popupSlice";
import { POPUP_CONTAINER_ID } from "../map/mapLibre";
import { selectLocation } from "../map/mapSlice";
import { selectPopup } from "../../app/configSlice";

const StyledPopup = styled(Box)(({ theme }) => ({
  width: 300,
  height: 450,
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  padding: 0,
  borderRadius: "var(--border-radius-xlarge)",
  outline: "none",
  position: "relative",
  textAlign: "left",
  overflowY: "auto",
  "@media (min-width: 400px)": {
    width: 380,
  },
  "@media (min-width: 768px)": {
    width: "100%",
    height: "auto",
    minWidth: 600,
    maxWidth: 700,
    maxHeight: 450,
    margin: "auto",
    overflow: "hidden",
  },
}));

const StylePopupInner = styled(Box)(() => ({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  overflowY: "auto",
  scrollbarWidth: "thin",
  scrollbarColor: "rgba(0, 0, 0, 0.3) rgba(0, 0, 0, 0.1)",
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    background: "rgba(0, 0, 0, 0.1)",
    borderRadius: "10px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: "10px",
  },
  "@media (min-width: 768px)": {
    flexDirection: "row",
    width: "100%",
    overflowY: "hidden",
  },
}));

const Popup = () => {
  const dispatch = useAppDispatch();
  const open = useAppSelector(selectPopupIsOpen);
  const popupIndex = useAppSelector(selectPopupIndex);
  const hasLocation = !!useAppSelector(selectLocation(popupIndex));
  const data = useAppSelector(selectPopupData);
  const popupConfig = useAppSelector(selectPopup) || {
    titleProp: "name",
    leftPane: [],
    topRightPane: [],
    bottomRightPane: [],
  };

  if (open) console.log("Popup data", data);

  const popupComponent = data ? (
    <StyledPopup>
      <StylePopupInner>
        <LeftPane
          data={data}
          hasLocation={hasLocation}
          config={popupConfig.leftPane}
          titleProp={popupConfig.titleProp}
        />
        <RightPane
          data={data}
          configTop={popupConfig.topRightPane}
          configBottom={popupConfig.bottomRightPane}
        />
      </StylePopupInner>
    </StyledPopup>
  ) : null;

  return (
    open &&
    (hasLocation ? (
      document.getElementById(POPUP_CONTAINER_ID) &&
      createPortal(
        popupComponent,
        document.getElementById(POPUP_CONTAINER_ID)!!,
      )
    ) : (
      // Just show popup in the middle of the screen if no location is available
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "rgba(0,0,0,0.7)",
          position: "relative",
          zIndex: 5,
        }}
        onClick={() => dispatch(closePopup())}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            maxWidth: 700,
          }}
        >
          {popupComponent}
        </div>
      </div>
    ))
  );
};

export default Popup;
