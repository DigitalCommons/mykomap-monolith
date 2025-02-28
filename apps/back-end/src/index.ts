import fastifySentryPlugin from "@immobiliarelabs/fastify-sentry";
import closeWithGrace from "close-with-grace";
import { FastifyListenOptions, fastify } from "fastify";
import cors from "@fastify/cors";
import qs from "qs";
import apiPlugin from "./pluginApi.js";
export { apiPlugin }; // For use as a library

// Something is weird about udsv, we can't import nor export Schema directly and
// seem to have to do this...
import udsv from "udsv";
import { fileURLToPath } from "url";
import { dirname } from "path";
export type Schema = ReturnType<typeof udsv.inferSchema>;

// This class exists to encapsulate the process of starting the Mykomap server.
//
// The intention is that eveything a server needs is set in here, but also to
// allow default parameters to be overridden, and extra plug-ins to be
// registered, as we do need to in some scenarios. (Specifically, when run with
// FastifyVite, that plug-in needs to be registered after the defaults have
// been)
//
// Usage:
//
//     const launcher = new Launcher(); // creates the server
//
//     // Optionally alter the default paramters here.
//
//     await launcher.addDefaultPlugins(); // registers the default plugins
//
//     // Optionally, register any extra plugins we need here:
//     launcher.app.register( /* ... */ );
//
//     const err = await launcher.start(); // start the server - should never return.
//     process.exit(err == undefined? 1 : 0);
//
export class Launcher {
  // The base Fasify server application.
  //
  // It has a logger and a querystringParser defined.
  //
  // Fastify types are a bit of a nightmare. We delilberately don't put a type
  // here because the type is so complicated it seems impossible to express
  // generally without type errors when you assign to it...
  readonly app = fastify({
    logger: {
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
    },
    // Fastify doesn't parse query param arrays properly, so we need to use qs
    // https://github.com/ts-rest/ts-rest/issues/290
    querystringParser: (str) => qs.parse(str),
  });

  // Sets the number of milliseconds required for a graceful close to complete
  closeGraceDelay = Number(process.env.FASTIFY_CLOSE_GRACE_DELAY) || 500;

  // Defines the origin(s) for the purposes of CORS.
  // This environment variable will be interpreted as a space-delimited list of
  // URLs, which the Access-Control-Allow-Origin CORS header should allow.
  // @fastify/cors will add an onRequest hook and a wildcard options route for this.
  corsOrigin = process.env.FASTIFY_CORS_ORIGIN?.split(/\s+/) || [];

  // The TCP port to the webserver should listen on
  listenPort = Number(process.env.FASTIFY_PORT) || 3000;

  // The API path prefix to set.
  apiPathPrefix = process.env.API_PATH_PREFIX || "/";

  // Where to load data from
  dataRoot =
    process.env.SERVER_DATA_ROOT ??
    dirname(fileURLToPath(import.meta.resolve("@mykomap/back-end/test/data")));

  // Constructs the ServerLauncher with a stock fastify instance.
  constructor() {}

  // Adds any default plugins we need.
  //
  // You should call this before calling listen() else the server will have
  // no API plugin registered!
  async addDefaultPlugins(): Promise<void> {
    // The Sentry error handler must be the first plugin registered
    if (process.env.GLITCHTIP_KEY) {
      console.log("Initialising Sentry...");
      await this.app.register(fastifySentryPlugin, {
        dsn: `https://${process.env.GLITCHTIP_KEY}@app.glitchtip.com/9203`,
        environment: process.env.NODE_ENV,
        release: __BUILD_INFO__.version.join("."),
        // Capture all uncaught or HTTP 4xx and 5xx errors
        // Note this doesn't work for TsRestResponseErrors since they skip this middleware
        shouldHandleError: (error) =>
          !error.statusCode || error.statusCode >= 400,
      });
    }

    try {
      // Register CORS plugin - this is primarily to allow the back end to
      // be on a different host/port.
      if (this.corsOrigin) {
        console.log("Registering CORS at ", this.corsOrigin);
        await this.app.register(cors, {
          origin: this.corsOrigin,
        });
      }

      // Mykomap API options
      const opts = {
        dataRoot: this.dataRoot,
      };
      console.info(`Using back-end data path: ${opts.dataRoot}`);

      // Register the API routes
      await this.app.register(apiPlugin, {
        mykomap: opts,
        prefix: this.apiPathPrefix,
        responseValidation: true,
      });
    } catch (err) {
      this.app.log.error(err);
    }
  }

  // Start the server listening.
  //
  // Returns the result of this.app.listen(), or rethrows whatever was caught in
  // the error block, after logging it.
  async listen(
    opts: FastifyListenOptions = { port: this.listenPort },
  ): Promise<unknown> {
    // This closes the application with a delay to clear up.
    closeWithGrace(
      { delay: this.closeGraceDelay },
      async ({ signal: _signal, err, manual: _manual }) => {
        if (err) {
          this.app?.log?.error(err);
          console.error(err);
        }
        await this.app?.close();
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
        this.app.close();
      });
    }

    try {
      // Start listening
      return await this.app.listen(opts);
    } catch (err) {
      this.app.log.error(err);
      throw err;
    }
  }

  // Shortcut method for starting the launcher.
  //
  // Creates a default Launcher, .addDefaultPlugins() it, then calls .listen()
  static async start() {
    const launcher = new Launcher();
    await launcher.addDefaultPlugins();
    await launcher.listen();
  }
}
