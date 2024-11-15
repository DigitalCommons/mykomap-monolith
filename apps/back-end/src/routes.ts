import { TsRestResponseError } from "@ts-rest/core";
import { RouterImplementation } from "@ts-rest/fastify";
import { contract } from "@mykomap/common";
import { FastifyPluginOptions } from "fastify";
import fs from "node:fs";
import {
  getDatasetConfig,
  getDatasetItem,
  getDatasetLocations,
  initDatasets,
  searchDataset,
} from "./services/datasetService.js";

/** Provides the shared configuration options for the Mykomap router implementation. */
export interface MykomapRouterConfig extends FastifyPluginOptions {
  /** Options specifically used by Mykomap Api plugin go in here */
  mykomap: {
    /** Defines the path to the data store */
    dataRoot: string;
  };
}

//////////////////////////////////////////////////////////////////////
// Helper types

/** The Mykomap API contract type */
type Contract = typeof contract;

//////////////////////////////////////////////////////////////////////

/**
 * Constructor for the MykoMap API router implementation.
 *
 * Accepts the router configuration, and returns an implementation using that configuration.
 *
 * See the Contract definition for details and documentation of the routes.
 *
 * Implementation Note: this is not a class, as ts-rest will attempt to recurse over its
 * members, and any non-router members seem to make it explode when it does that.
 * Therefore, we use a closure to store the configuration options, out of harm's way.
 */
export function MykomapRouter(
  opts: MykomapRouterConfig,
): RouterImplementation<Contract> {
  // Validation
  if (opts?.mykomap?.dataRoot == undefined)
    // deliberately loose check
    throw new Error("mandatory dataRoot option is not defined");

  if (!fs.existsSync(opts.mykomap.dataRoot))
    throw new Error(
      `the dataRoot plugin option is set but refers to a non-existing path: ` +
        `'${opts.mykomap.dataRoot}'.`,
    );

  console.log("Initialising datasets...");
  initDatasets(opts.mykomap.dataRoot);

  // Construct and return the implementation object
  return {
    getDatasetLocations: async ({ params: { datasetId }, request, reply }) => {
      const stream = getDatasetLocations(datasetId);
      reply.header("Content-Type", "application/json");

      // Send the locations as a stream attached to the reply, which avoids the need to load the
      // file - which is potentially very large - deserialise it from JSON, and then re-serialise it
      // back to JSON. One consequence of this is that the content cannot be validated. You must
      // supply a pre-validated locations.json!
      reply.send(stream);
      return reply;
    },

    searchDataset: async ({
      params: { datasetId },
      query: { filter, text },
    }) => {
      const visibleIndexes = searchDataset(datasetId, filter, text);

      return { status: 200, body: visibleIndexes };
    },

    getDatasetItem: async ({ params: { datasetId, datasetItemIdOrIx } }) => {
      // datasetItemIdOrIx could be either an ID or an Index. But for the purposes here, just
      // assume it is an Index.
      // TODO: extend this method to handle full IDs too
      if (!datasetItemIdOrIx.startsWith("@")) {
        throw new TsRestResponseError(contract.getDatasetItem, {
          status: 400,
          body: { message: `We can only handle item indexes right now` },
        });
      }

      const itemId = Number(datasetItemIdOrIx.substring(1));
      const item = getDatasetItem(datasetId, itemId);

      return { status: 200, body: item };
    },

    getConfig: async ({ params: { datasetId } }) => {
      const config = getDatasetConfig(datasetId);

      return { status: 200, body: config };
    },

    getVersion: async () => {
      return {
        status: 200,
        body: __BUILD_INFO__,
      };
    },
  };
}
