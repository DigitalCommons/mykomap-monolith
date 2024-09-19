import { RouterImplementation } from "@ts-rest/fastify";
import { contract } from "@mykomap/common";
import { FastifyPluginOptions } from "fastify";

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
  // Construct and return the implementation object
  return {
    async getDataset(req) {
      return {
        body: [[1, 1]],
        status: 200,
      };
    },

    async searchDataset(req) {
      return {
        body: [1],
        status: 200,
      };
    },

    async getDatasetItem(req) {
      return {
        body: "FIXME",
        status: 200,
      };
    },

    async getVersion(req) {
      return {
        body: "FIXME",
        status: 200,
      };
    },
  };
}
