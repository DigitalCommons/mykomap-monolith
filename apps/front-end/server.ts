import FastifyVite from "@fastify/vite";
import { Launcher } from "@mykomap/back-end";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const root = dirname(fileURLToPath(import.meta.url));

// Create the basic Launcher instance
const launcher = new Launcher();

launcher.apiPathPrefix = "/api"; // Required when running in this mode

// We always want these.
await launcher.addDefaultPlugins();

// Next, add the plugins needed to run with a Vite build server
await launcher.app.register(FastifyVite, {
  root,
  // NOTE: if this isn't set true, things seem to break?
  dev: process.env.NODE_ENV === "development",
  spa: true,
});

// Set the default route to load the front end app
await launcher.app.get("/", (req, reply) => {
  return reply.html();
});

await launcher.app.vite.ready();
await launcher.listen();
