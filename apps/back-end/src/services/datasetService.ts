import fs from "node:fs";
import path from "node:path";
import { TsRestResponseError } from "@ts-rest/core";

import { contract } from "@mykomap/common";
import { Dataset } from "./Dataset.js";

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

const getDatasetOrThrow404 = (datasetId: string): Dataset => {
  const dataset = datasets[datasetId];

  if (!dataset)
    throw new TsRestResponseError(contract.searchDataset, {
      status: 404,
      body: { message: `dataset ${datasetId} doesn't exist` },
    });

  return dataset;
};

export const getDatasetItem = (datasetId: string, datasetItemId: number) => {
  const dataset = getDatasetOrThrow404(datasetId);
  return dataset.getItem(datasetItemId);
};

export const getDatasetConfig = (datasetId: string) => {
  const dataset = getDatasetOrThrow404(datasetId);
  return dataset.getConfig();
};

export const getDatasetLocations = (datasetId: string): fs.ReadStream => {
  const dataset = getDatasetOrThrow404(datasetId);
  return dataset.getLocations();
};

export const searchDataset = (
  datasetId: string,
  filter?: string[],
  text?: string,
): number[] => {
  const dataset = getDatasetOrThrow404(datasetId);
  return dataset.search(filter, text);
};
