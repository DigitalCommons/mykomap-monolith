import closeWithGrace from "close-with-grace";
import dotenv from "dotenv";
import Fastify from "fastify";
import plugin from "./index.js";
import { options } from "./index.js";

// delay is the number of milliseconds for the graceful close to finish
closeWithGrace(
  { delay: process.env.FASTIFY_CLOSE_GRACE_DELAY || 500 },
  async ({ signal, err, manual }) => {
    if (err) app.log.error(err);
    await app.close();
  },
);

const start = async () => {
  const fastify = Fastify({
    logger: true,
  });

  try {
    fastify.register(plugin, options);
    await fastify.listen({ port: process.env.FASTIFY_PORT || 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Run the server!
start();
