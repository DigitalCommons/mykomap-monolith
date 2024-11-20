import fs from "node:fs";
import path from "node:path";
import {
  AppRoute,
  ServerInferResponseBody,
  TsRestResponseError,
} from "@ts-rest/core";

import { contract } from "@mykomap/common";
import { Dataset } from "./Dataset.js";

type GetConfigBody = ServerInferResponseBody<typeof contract.getConfig, 200>;
type SearchDatasetBody = ServerInferResponseBody<
  typeof contract.searchDataset,
  200
>;

const datasets: { [id: string]: Dataset } = {};

/**
 * This method instantiates a Dataset object for each of the datasets in the dataRoot/datasets
 * directory in the filesystem.
 */
export const initDatasets = (dataRoot: string) => {
  const datasetIds = fs
    .readdirSync(path.join(dataRoot, "datasets"), { withFileTypes: true })
    .filter((f) => f.isDirectory())
    .map((f) => f.name);

  console.log("Found datasets:", datasetIds);

  for (const datasetId of datasetIds) {
    datasets[datasetId] = new Dataset(datasetId, dataRoot);
  }
};

const getDatasetOrThrow404 = (
  appRoute: AppRoute,
  datasetId: string,
): Dataset => {
  const dataset = datasets[datasetId];

  if (!dataset)
    throw new TsRestResponseError(appRoute, {
      status: 404,
      body: { message: `dataset ${datasetId} doesn't exist` },
    });

  return dataset;
};

export const getDatasetItem = (datasetId: string, datasetItemIx: number) => {
  const dataset = getDatasetOrThrow404(contract.getDatasetItem, datasetId);
  return dataset.getItem(datasetItemIx);
};

export const getDatasetConfig = (datasetId: string): GetConfigBody => {
  const dataset = getDatasetOrThrow404(contract.getConfig, datasetId);
  return dataset.getConfig();
};

export const getDatasetAbout = (datasetId: string): string => {
  const dataset = getDatasetOrThrow404(contract.getAbout, datasetId);
  return dataset.getAbout();
};

export const getDatasetLocations = (datasetId: string): fs.ReadStream => {
  const dataset = getDatasetOrThrow404(contract.getDatasetLocations, datasetId);
  return dataset.getLocations();
};

export const searchDataset = (
  datasetId: string,
  filter?: string[],
  text?: string,
  returnProps?: string[],
  page?: number,
  pageSize?: number,
): SearchDatasetBody => {
  const dataset = getDatasetOrThrow404(contract.searchDataset, datasetId);
  return dataset.search(
    filter,
    text,
    returnProps,
    page,
    pageSize,
  ) as SearchDatasetBody;
};
