import fs from "node:fs";
import path from "node:path";
import { ServerInferResponseBody } from "@ts-rest/core";

import { contract } from "@mykomap/common";
import { Dataset } from "./Dataset.js";
import { HttpError } from "../errors.js";

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
    .filter((f) => f.isDirectory() || f.isSymbolicLink())
    .map((f) => f.name);

  console.log("Found datasets:", datasetIds);

  const loadedDatasetIds: string[] = [];
  for (const datasetId of datasetIds) {
    try {
      datasets[datasetId] = new Dataset(datasetId, dataRoot);
      loadedDatasetIds.push(datasetId);
    } catch (e) {
      // Report the short form error at error level
      console.error(`Dataset '${datasetId}' failed to load, skipping it: ${e}`);
      // Report the long-form error cause at debug level
      if (e instanceof Error && e.cause)
        console.debug(`Dataset '${datasetId}' failed because: ${e.cause}`);
    }
  }

  console.log("Loaded datasets:", loadedDatasetIds);
};

const getDatasetOrThrow404 = (datasetId: string): Dataset => {
  const dataset = datasets[datasetId];

  if (!dataset) throw new HttpError(404, `dataset ${datasetId} doesn't exist`);

  return dataset;
};

export const getDatasetItemByIx = (
  datasetId: string,
  datasetItemIx: number,
  returnProps?: string[],
) => {
  const dataset = getDatasetOrThrow404(datasetId);
  return dataset.getItemByIx(datasetItemIx, returnProps);
};

export const getDatasetItemById = (
  datasetId: string,
  datasetItemId: string,
  returnProps?: string[],
) => {
  const dataset = getDatasetOrThrow404(datasetId);
  return dataset.getItemById(datasetItemId, returnProps);
};

export const getDatasetConfig = (datasetId: string): GetConfigBody => {
  const dataset = getDatasetOrThrow404(datasetId);
  return dataset.getConfig();
};

export const getDatasetAbout = (datasetId: string): string => {
  const dataset = getDatasetOrThrow404(datasetId);
  return dataset.getAbout();
};

export const getDatasetLocations = (datasetId: string): fs.ReadStream => {
  const dataset = getDatasetOrThrow404(datasetId);
  return dataset.getLocations();
};

export const getTotals = (datasetId: string) => {
  const dataset = getDatasetOrThrow404(datasetId);
  return dataset.getTotals();
};

export const searchDataset = (
  datasetId: string,
  filter?: string[],
  text?: string,
  returnProps?: string[],
  page?: number,
  pageSize?: number,
): SearchDatasetBody => {
  const dataset = getDatasetOrThrow404(datasetId);
  return dataset.search(
    filter,
    text,
    returnProps,
    page,
    pageSize,
  ) as SearchDatasetBody;
};
