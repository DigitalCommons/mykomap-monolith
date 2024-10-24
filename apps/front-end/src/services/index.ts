import { initClient } from "@ts-rest/core";
import { contract } from "@mykomap/common";

const client = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL,
  baseHeaders: {},
});

export const {
  getDatasetLocations,
  searchDataset,
  getDatasetItem,
  getVersion,
} = client;
