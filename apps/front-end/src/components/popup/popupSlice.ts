import { createAppSlice } from "../../app/createAppSlice";
import { getDatasetItem } from "../../services";
import { getUrlSearchParam } from "../../utils/window-utils";

interface PopupState {
  isOpen: boolean;
  index: number;
  id: string;
  status: string;
  // TODO: handle different fields rather than hardcoding them, use config to define how they should
  // be displayed
  data: {
    name: string;
    primaryActivity: string;
    description: string;
    dcDomains: string[];
    address: string;
    website: string;
    organisationalStructure: string;
    typology: string;
    dataSources: string[];
  };
}

const initialState: PopupState = {
  isOpen: false,
  index: -1,
  id: "",
  status: "loading",
  data: {
    name: "",
    primaryActivity: "",
    description: "",
    dcDomains: [],
    address: "",
    website: "",
    organisationalStructure: "",
    typology: "",
    dataSources: [],
  },
};

export const popupSlice = createAppSlice({
  name: "popup",
  initialState,
  reducers: (create) => ({
    closePopup: create.reducer((state) => {
      state.isOpen = false;
    }),
    openPopup: create.asyncThunk(
      async (index: number, thunkApi) => {
        const datasetId = getUrlSearchParam("datasetId");
        if (datasetId === null) {
          return thunkApi.rejectWithValue(
            `No datasetId parameter given, so dataset locations cannot be fetched`,
          );
        }

        const response = await getDatasetItem({
          params: { datasetId, datasetItemIdOrIx: `@${index}` },
        });

        if (response.status === 200) {
          return response.body;
        } else {
          return thunkApi.rejectWithValue(
            `Failed search, status code ${response.status}`,
          );
        }
      },
      {
        pending: (state) => {
          state.status = "loading";
        },
        fulfilled: (state, action) => {
          state.status = "loaded";
          state.index = action.meta.arg;
          state.isOpen = true;

          // Attempt at dynamic key assignment which doesn't work:
          // type a = keyof PopupState["data"];
          // const data: PopupState["data"] = state.data;
          // for (const key in state.data) {
          //   data[key as a] = action.payload[key] as keyof typeof state.data;
          // }

          // Just hardcode for now:
          ({
            id: state.id,
            name: state.data.name,
            primary_activity: state.data.primaryActivity,
            description: state.data.description,
            dc_domains: state.data.dcDomains,
            geocoded_addr: state.data.address,
            website: state.data.website,
            organisational_structure: state.data.organisationalStructure,
            typology: state.data.typology,
            data_sources: state.data.dataSources,
          } = action.payload as {
            id: string;
            name: string;
            primary_activity: string;
            description: string;
            dc_domains: string[];
            geocoded_addr: string;
            website: string;
            organisational_structure: string;
            typology: string;
            data_sources: string[];
          });
        },
        rejected: (state, action) => {
          state.status = "failed";
          // state.allLocations = [];
          console.error(
            `Error fetching popup content for item @${action.meta.arg}`,
            action.payload,
          );
        },
      },
    ),
  }),
  selectors: {
    selectPopupIsOpen: (popup) => popup.isOpen,
    selectPopupIndex: (popup) => popup.index,
    selectPopupData: (popup) => popup.data,
  },
});

export const { openPopup, closePopup } = popupSlice.actions;
export const { selectPopupIsOpen, selectPopupIndex, selectPopupData } =
  popupSlice.selectors;
