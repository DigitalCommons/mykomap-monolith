import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import { apiPlugin, apiOptions } from "@mykomap/back-end";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const server = Fastify();
const root = dirname(fileURLToPath(import.meta.url));

await server.register(FastifyVite, {
  root,
  // NOTE: if this isn't set true, things seem to break?
  dev: process.env.NODE_ENV === "development",
  spa: true,
});
apiOptions.serviceOptions.dataRoot = dirname(
  fileURLToPath(import.meta.resolve("@mykomap/back-end/test/data")),
);
server.register(apiPlugin, { ...apiOptions, prefix: "/api" });

server.get("/", (req, reply) => {
  return reply.html();
});

await server.vite.ready();

await server.listen({ port: 3000 });
