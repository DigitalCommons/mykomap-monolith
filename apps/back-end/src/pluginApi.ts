import * as dotenv from "dotenv";
import { MykomapRouterConfig, MykomapRouter } from "./routes.js";
import { initServer } from "@ts-rest/fastify";
import { contract } from "@mykomap/common";
import { FastifyInstance, FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";
import { createReadStream, statSync } from "node:fs";
import { extname, resolve, sep } from "node:path";

dotenv.config();

// As per the guide fpr "Creating a TypeScript Fastify Plugin"
// https://fastify.dev/docs/latest/Reference/TypeScript/#creating-a-typescript-fastify-plugin
declare module "fastify" {
  interface FastifyRequest {}
  interface FastifyReply {}
}

const ASSET_MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
};

/** Defines our API as a Fastify plugin */
const pluginApi: FastifyPluginCallback<MykomapRouterConfig> = async (
  fastify: FastifyInstance,
  opts: MykomapRouterConfig,
) => {
  // Tease apart Mykomap option from all others
  const { mykomap, ...fastifyOpts } = opts;

  // Streaming static-file route for per-dataset assets. Registered as a plain
  // Fastify route (rather than via the ts-rest contract) because the contract
  // is JSON-only and ts-rest can't model a wildcard binary response. Mirrors
  // the streaming approach used by getDatasetLocations.
  fastify.get<{ Params: { datasetId: string; "*": string } }>(
    "/dataset/:datasetId/assets/*",
    async (request, reply) => {
      const { datasetId } = request.params;
      const rest = request.params["*"];

      const assetsRoot = resolve(
        mykomap.dataRoot,
        "datasets",
        datasetId,
        "assets",
      );
      const target = resolve(assetsRoot, rest);

      // Path-traversal guard: resolved target must stay under assetsRoot.
      if (target !== assetsRoot && !target.startsWith(assetsRoot + sep)) {
        reply.code(403).send({ message: "forbidden" });
        return reply;
      }

      let stats;
      try {
        stats = statSync(target);
      } catch {
        reply.code(404).send({ message: "asset not found" });
        return reply;
      }
      if (!stats.isFile()) {
        reply.code(404).send({ message: "asset not found" });
        return reply;
      }

      const mime =
        ASSET_MIME_TYPES[extname(target).toLowerCase()] ??
        "application/octet-stream";
      reply.header("Content-Type", mime);
      reply.send(createReadStream(target));
      return reply;
    },
  );

  // Get ts-rest's machinery going,
  const tsrServer = initServer();

  // Feed our implementation to it,
  const router = tsrServer.router(contract, MykomapRouter({ mykomap }));

  // Plop out a Fastify plugin,
  const plugin = tsrServer.plugin(router);

  // And register it.
  fastify.register(plugin, fastifyOpts);
};

/** Export our prepared plugin */
export default fp(pluginApi);
