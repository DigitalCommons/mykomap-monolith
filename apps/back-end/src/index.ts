import fastifySentryPlugin from "@immobiliarelabs/fastify-sentry";
import closeWithGrace from "close-with-grace";
import Fastify from "fastify";
import cors from "@fastify/cors";
import qs from "qs";
import apiPlugin from "./pluginApi.js";
export { apiPlugin }; // For use as a library

// Something is weird about udsv, we can't import nor export Schema directly and
// seem to have to do this...
import udsv from "udsv";
export type Schema = ReturnType<typeof udsv.inferSchema>;

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
const apiPathPrefix = process.env.API_PATH_PREFIX || "/";

export const start = async () => {
  const app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
    },
    // Fastify doesn't parse query param arrays properly, so we need to use qs
    // https://github.com/ts-rest/ts-rest/issues/290
    querystringParser: (str) => qs.parse(str),
  });

  // The Sentry error handler must be the first plugin registered
  if (process.env.GLITCHTIP_KEY) {
    console.log("Initialising Sentry...");
    app.register(fastifySentryPlugin, {
      dsn: `https://${process.env.GLITCHTIP_KEY}@app.glitchtip.com/9203`,
      environment: process.env.NODE_ENV,
      release: __BUILD_INFO__.version.join("."),
      // Capture all uncaught or HTTP 4xx and 5xx errors
      // Note this doesn't work for TsRestResponseErrors since they skip this middleware
      shouldHandleError: (error) =>
        !error.statusCode || error.statusCode >= 400,
    });
  }

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
      console.log("Reload");
      app.close();
    });
  }

  try {
    // Register CORS plugin - this is primarily to allow the back end to
    // be on a different host/port.
    if (corsOrigin) {
      console.log("Registering CORS at ", corsOrigin);
      await app.register(cors, {
        origin: corsOrigin,
      });
    }

    // Mykomap API options
    const opts = {
      dataRoot: process.env.SERVER_DATA_ROOT ?? "test/data",
    };

    // Register the API routes
    await app.register(apiPlugin, {
      mykomap: opts,
      prefix: apiPathPrefix,
      responseValidation: true,
    });

    // Start listening
    await app.listen({ port: listenPort });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};
