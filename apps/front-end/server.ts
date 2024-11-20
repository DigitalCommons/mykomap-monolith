import Fastify from "fastify";
import FastifyVite from "@fastify/vite";
import { apiPlugin } from "@mykomap/back-end";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const logger = { level: process.env.SERVER_LOG_LEVEL };
const server = Fastify({ logger });
const root = dirname(fileURLToPath(import.meta.url));

await server.register(FastifyVite, {
  root,
  // NOTE: if this isn't set true, things seem to break?
  dev: process.env.NODE_ENV === "development",
  spa: true,
});

// Mykomap API options
const backEndTestData = dirname(
  fileURLToPath(import.meta.resolve("@mykomap/back-end/test/data")),
);
const mykomap = {
  dataRoot: process.env.SERVER_DATA_ROOT ?? backEndTestData,
};
console.info(`Using back-end data path: ${mykomap.dataRoot}`);

server.register(apiPlugin, { mykomap, prefix: "/api" });

server.get("/", (req, reply) => {
  return reply.html();
});

await server.vite.ready();

await server.listen({ port: 3000 });
