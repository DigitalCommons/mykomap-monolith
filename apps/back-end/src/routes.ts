import { TsRestResponseError } from "@ts-rest/core";
import { RouterImplementation } from "@ts-rest/fastify";
import { contract } from "@mykomap/common";
import { FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import fs from "node:fs";
import path from "node:path";
import { initDatasets } from "./services/datasetService.js";

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
// Helper functions

/** Send a JSON file verbatim as Fastify's reply
 *
 * This function sends the file as a stream attached to the reply, which avoids
 * the need to load the file - which is potentially very large - deserialise it
 * from JSON, and then re-serialise it back to JSON.
 *
 * One consequence of this is that the content cannot be validated. You must
 * supply pre-validated files!
 *
 * @return true on success, false if the path doesn't correspond to a valid file
 * (in which case nothing can be sent).If successful, the reply will have
 * been modified to have an `application/json` content type, and the file
 * content attached as a stream. This reply can be returned from the handler
 * instead of a JSON object.
 */
function sendJson(req: FastifyRequest, reply: FastifyReply, file: string) {
  req.log.debug(`data file path is '${file}`);

  if (!fs.existsSync(file)) return false;

  const stream = fs.createReadStream(file, "utf8");
  reply.header("Content-Type", "application/json");
  reply.send(stream);

  return true;
}

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

  // TODO: uncomment this when the test/data has been created with the updated structure
  // initDatasets(opts.mykomap.dataRoot);

  // Concatenates the path components into an absolute file path
  const filePath = (...components: string[]): string => {
    const p = path.join(opts.mykomap.dataRoot ?? "", ...components) + ".json";
    return p;
  };

  // Construct and return the implementation object
  return {
    async getDataset({ params: { datasetId }, request, reply }) {
      // Validate the parameters some more

      if (!sendJson(request, reply, filePath("datasets", datasetId)))
        throw new TsRestResponseError(contract.getDataset, {
          status: 404,
          body: { message: `unknown datasetId '${datasetId}'` },
        });

      return reply;
    },

    async searchDataset({
      params: { datasetId },
      query: { filter, text },
      request,
      reply,
    }) {
      const filter2 = filter ?? [];

      const components = ["datasets", datasetId, "search", ...filter2, "text"];
      if (text !== undefined) components.push(encodeURIComponent(text));

      if (!sendJson(request, reply, filePath(...components)))
        return {
          status: 200,
          body: [],
        };

      return reply;
    },

    async getDatasetItem({
      params: { datasetId, datasetItemId },
      request,
      reply,
    }) {
      if (
        !sendJson(
          request,
          reply,
          filePath("datasets", datasetId, "items", String(datasetItemId)),
        )
      )
        throw new TsRestResponseError(contract.getDatasetItem, {
          status: 404,
          body: { message: `item retrieve failed` },
        });

      return reply;
    },

    async getVersion(req) {
      return {
        body: __BUILD_INFO__,
        status: 200,
      };
    },
  };
}
