import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { extendZodWithOpenApi } from "@anatine/zod-openapi";

extendZodWithOpenApi(z);

const c = initContract();

const Location = z.array(z.number()).min(2).max(2);
const DatasetId = z.string();
const DatasetItemId = z.number().int();
const DatasetItem = z.object({}).passthrough();
const Dataset = z.array(Location);
const VersionInfo = z.object({}).passthrough();

export const schemas = {
  Location,
  DatasetId,
  DatasetItemId,
  DatasetItem,
  Dataset,
};

export const contract = c.router({
  getDataset: {
    method: "GET",
    path: "/dataset/:datasetId",
    summary: "obtains a dataset",
    description:
      "Obtains a dataset by its ID, which by passing in the appropriate options, might be in different formats",
    pathParams: z.object({
      datasetId: DatasetId.openapi({
        // description: "uniquely specifies the dataset wanted",
      }),
    }),
    responses: {
      200: Dataset.openapi({
        // description: "the dataset matching the supplied ID",
      }),
      400: z.void().openapi({
        // description: "bad input parameter",
      }),
      404: z.void().openapi({
        // description: "no such dataset",
      }),
    },
  },
  searchDataset: {
    method: "GET",
    path: "/dataset/:datasetId/search",
    summary:
      "obtains a list of dataset entries satisfying the search criteria supplied",
    description:
      "Obtains an array of dataset item IDs, which match the search criteria supplied",
    query: z.object({
      text: z.string().optional().openapi({
        // description: "a text fragment to match",
      }),
      filter: z.array(z.string()).optional().openapi({
        // description: "uniquely specifies the taxonomy filter items wanted",
      }),
    }),
    pathParams: z.object({
      datasetId: DatasetId.openapi({
        // description: "uniquely specifies the dataset wanted",
      }),
    }),
    responses: {
      200: z.array(DatasetItemId).openapi({
        // description: "the dataset item IDs matching the supplied criteria",
      }),
      400: z.void().openapi({
        // description: "bad input parameter",
      }),
      404: z.void().openapi({
        // description: "no such dataset",
      }),
    },
  },
  getDatasetItem: {
    method: "GET",
    path: "/dataset/:datasetId/item/:datasetItemId",
    summary: "obtains a dataset item by its unique ID",
    description:
      "Obtains a single dataset item by its ID and the dataset's ID.",
    pathParams: z.object({
      datasetId: DatasetId.openapi({
        // description: "uniquely specifies the dataset wanted",
      }),
      datasetItemId: DatasetItemId.openapi({
        // description: "uniquely specifies the dataset item wanted",
      }),
    }),
    responses: {
      200: DatasetItem.openapi({
        // description: "the dataset item matching the supplied ID",
      }),
      400: z.void().openapi({
        // description: "bad input parameter",
      }),
      404: z.void().openapi({
        // description: "no such dataset or dataset item",
      }),
    },
  },
  getVersion: {
    method: "GET",
    path: "/version",
    summary: "obtains Mykomap server version information",
    description:
      "Obtains version information about the backend Mykomap server, in the form of a JSON object",
    responses: {
      200: VersionInfo.openapi({
        // description: "information about the current Mykomap server version",
      }),
    },
  },
});
