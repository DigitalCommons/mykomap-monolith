import { createSelector } from "@reduxjs/toolkit";
import { createAppSlice } from "../../app/createAppSlice";
import { getDatasetItem } from "../../services";
import { Config } from "../../services/types";
import { getDatasetId } from "../../utils/window-utils";
import { InnerPropSpec, PropSpecs } from "@mykomap/common";
import { configLoaded } from "../../app/configSlice";
import { Buffer } from "buffer";
import { SearchSliceState } from "../panel/searchPanel/searchSlice";

interface PopupSliceState {
  isOpen: boolean;
  index: number;
  id: string;
  status: "idle" | "loading" | "failed";
  itemProps: PropSpecs;
  data: {
    [key: string]: any;
  };
}

const initialState: PopupSliceState = {
  isOpen: false,
  index: -1,
  id: "",
  status: "idle",
  itemProps: {},
  data: {},
};

export const popupSlice = createAppSlice({
  name: "popup",
  initialState,
  reducers: (create) => ({
    closePopup: create.reducer((state) => {
      state.isOpen = false;
      state.index = -1;
      state.id = "";
      state.data = {};
    }),
    openPopup: create.asyncThunk(
      async (idOrIndex: string, thunkApi) => {
        const { popup } = thunkApi.getState() as { popup: PopupSliceState };
        if (
          (idOrIndex.startsWith("@") &&
            idOrIndex.substring(1) === popup.index.toString()) ||
          (!idOrIndex.startsWith("@") && idOrIndex === popup.id)
        ) {
          // Popup is already open for this item so no need to fetch again
          return {
            index: popup.index,
            id: popup.id,
            ...popup.data,
          };
        }

        const datasetId = getDatasetId();
        if (datasetId === null) {
          return thunkApi.rejectWithValue(
            `No datasetId parameter given, so popup cannot be fetched`,
          );
        }

        const encodeBase64 = (data: string) => {
          return Buffer.from(data, "utf-8").toString("base64");
        };

        console.log("Fetching popup with idOrIndex", idOrIndex);

        const response = await getDatasetItem({
          params: { datasetId, datasetItemIdOrIx: encodeBase64(idOrIndex) },
        });

        if (response.status === 200) {
          const { search } = thunkApi.getState() as {
            search: SearchSliceState;
          };

          if (
            search.visibleIndexes.length === 0 ||
            search.visibleIndexes.includes(response.body.index)
          ) {
            return response.body as typeof response.body;
          } else {
            return thunkApi.rejectWithValue(
              `Item index @${response.body.index} is not currently visible, so cannot open popup`,
            );
          }
        }

        return thunkApi.rejectWithValue(
          `Failed search, status code ${response.status}`,
        );
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.index = action.payload.index;
          state.id = action.payload.id;
          state.isOpen = true;
          const { index, ...data } = action.payload;
          state.data = data;
          state.status = "idle";
        },
        rejected: (state, action) => {
          state.status = "failed";
          // state.allLocations = [];
          console.error(
            `Error fetching popup content for item ${action.meta.arg}`,
            action.payload,
          );
        },
      },
    ),
  }),
  extraReducers: (builder) => {
    builder.addCase(configLoaded, (state, action) => {
      const config = action.payload;
      state.itemProps = config.itemProps;
    });
  },
  selectors: {
    selectPopupIsOpen: (popup) => popup.isOpen,
    selectPopupIndex: (popup) => popup.index,
    selectPopupId: (popup) => popup.id,
  },
});

export const { openPopup, closePopup } = popupSlice.actions;
export const { selectPopupIsOpen, selectPopupIndex, selectPopupId } =
  popupSlice.selectors;

export const selectPopupData = createSelector(
  [
    (state): PopupSliceState["data"] => state.popup.data,
    (state): PropSpecs => state.popup.itemProps,
    (state): Config["vocabs"] => state.config.vocabs,
    (state): string => state.config.currentLanguage,
  ],
  (
    popupData,
    itemProps,
    vocabs,
    language,
  ): PopupSliceState["data"] | undefined => {
    if (Object.keys(itemProps).length === 0 || Object.keys(vocabs).length === 0)
      return undefined; // Config not loaded yet

    const data: any = {};
    Object.entries(popupData).forEach(([propName, value]) => {
      const prop = itemProps[propName];

      const { innerProp, values } = (
        prop?.type === "multi"
          ? { innerProp: prop.of, values: value }
          : { innerProp: prop, values: [value] }
      ) as { innerProp: InnerPropSpec; values: string[] };

      const translatedValues = values.map((value: string) =>
        innerProp?.type === "vocab"
          ? vocabs[innerProp.uri.split(":")[0]][language].terms[value]
          : value,
      );

      data[propName] =
        prop?.type === "multi" ? translatedValues : translatedValues[0];
    });

    return data;
  },
);
