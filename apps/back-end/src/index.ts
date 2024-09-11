import closeWithGrace from "close-with-grace";
import Fastify from "fastify";
import cors from "@fastify/cors";
import apiPlugin, { options } from "./pluginApi.js";
export { apiPlugin, options as apiOptions }; // For use as a library

// Set the number of milliseconds required for a graceful close to complete
const closeGraceDelay = Number(process.env.FASTIFY_CLOSE_GRACE_DELAY) || 500;

// Define the origin(s) for the purposes of CORS.
// This environment variable will be interpreted as a space-delimited list of
// URLs, which the Access-Control-Allow-Origin CORS header should allow.
// @fastify/cors will add an onRequest hook and a wildcard options route for this.
const corsOrigin = process.env.FASTIFY_CORS_ORIGIN?.split(/\s+/) || [];

// The TCP port to the webserver should listen on
const listenPort = Number(process.env.FASTIFY_PORT) || 3000;

// The API path prefix to set.
const apiPathPrefix = process.env.API_PATH_PREFIX || '/';

export const start = async () => {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
    },
  });

  // This closes the application with a delay to clear up.
  closeWithGrace(
    { delay: closeGraceDelay },
    async ({ signal: _signal, err, manual: _manual }) => {
      if (err) {
        app?.log?.error(err);
        console.error(err);
      }
      await app?.close();
    },
  );

  // This avoids EADDRINUSE errors caused when vite-node's HMR tries to
  // restart the server when the old one is still running.
  // https://github.com/vitest-dev/vitest/issues/2334
  // @ts-ignore // seems  to be a bug in vite that this is not defined
  if (import.meta.hot) {
    // @ts-ignore
    import.meta.hot.on("vite:beforeFullReload", () => {
      app.close();
    });  
  }

  try {
    // Register CORS plugin - this is primarily to allow the back end to
    // be on a different host/port.
    await app.register(cors, {
      origin: corsOrigin,
    });

    // Register the API routes
    await app.register(apiPlugin, { ...options, prefix: apiPathPrefix });

    // Start listening
    await app.listen({ port: listenPort });
    
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
