import { initClient } from "@ts-rest/core";
import { contract } from "@mykomap/common";

const client = initClient(contract, {
  baseUrl: "http://localhost:3000",
  baseHeaders: {},
});

export const { getDataset, searchDataset, getDatasetItem, getVersion } = client;
