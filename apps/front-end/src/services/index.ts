import { initClient, ClientInferResponseBody } from "@ts-rest/core";
import { contract } from "@mykomap/common";

const client = initClient(contract, {
  baseUrl: import.meta.env.VITE_API_URL,
  baseHeaders: {},
});

export const {
  getConfig,
  getDatasetLocations,
  searchDataset,
  getDatasetItem,
  getVersion,
} = client;

export type Config = ClientInferResponseBody<typeof contract.getConfig, 200>;
