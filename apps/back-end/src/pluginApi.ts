import * as dotenv from "dotenv";
import { MykomapRouterConfig, MykomapRouter } from "./routes.js";
import { initServer } from "@ts-rest/fastify";
import { contract } from "@mykomap/common";
import { FastifyInstance, FastifyPluginCallback } from "fastify";
import fp from "fastify-plugin";

dotenv.config();

// As per the guide fpr "Creating a TypeScript Fastify Plugin"
// https://fastify.dev/docs/latest/Reference/TypeScript/#creating-a-typescript-fastify-plugin
declare module "fastify" {
  interface FastifyRequest {}
  interface FastifyReply {}
}

/** Defines our API as a Fastify plugin */
const pluginApi: FastifyPluginCallback<MykomapRouterConfig> = async (
  fastify: FastifyInstance,
  opts: MykomapRouterConfig,
) => {
  // Tease apart Mykomap option from all others
  const { mykomap, ...fastifyOpts } = opts;

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
