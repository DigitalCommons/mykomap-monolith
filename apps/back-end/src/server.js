import closeWithGrace from "close-with-grace";
import Fastify from "fastify";
import cors from "@fastify/cors";
import plugin, { options } from "./index.js";

let app;

// delay is the number of milliseconds for the graceful close to finish
closeWithGrace(
  { delay: process.env.FASTIFY_CLOSE_GRACE_DELAY || 500 },
  async ({ signal, err, manual }) => {
    if (err) {
      app?.log?.error(err);
      console.error(err);
    }
    await app?.close();
  },
);

const start = async () => {
  app = Fastify({
    logger: {
      level: process.env.NODE_ENV === "development" ? "debug" : "info",
    },
  });

  await app.register(cors, {
    origin: process.env.NODE_ENV === "development" && ["http://localhost:5173"],
  });

  try {
    await app.register(plugin, options);
    await app.listen({ port: process.env.FASTIFY_PORT || 3000 });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

// Run the server!
start();
