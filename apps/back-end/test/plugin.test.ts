/// <reference types="vitest"/>
// this file contains a test harness that was auto-generated by fastify-openapi-glue
// running the tests directly after generation will probably fail as the parameters
// need to be manually added.

import { expect, test } from "vitest";
import Fastify from "fastify";
import fastifyPlugin from "../src/pluginApi";
import * as path from "node:path";
import { MykomapRouterConfig } from "../src/routes";

const opts: MykomapRouterConfig = {
  mykomap: {
    dataRoot: path.join(import.meta.dirname, "data"),
  },
};

// Note: see src/api/contract.ts in the @mykomap/common module for definitions
// and documentation of the API.

test("testing dataset", async (t) => {
  const fastify = Fastify();
  fastify.register(fastifyPlugin, opts);

  const res = await fastify.inject({
    method: "GET",
    url: "/dataset/test-A/locations",
    payload: undefined,
    headers: undefined,
  });
  expect(res.statusCode).toBe(200);
});

test("testing datasetSearch", async (t) => {
  const fastify = Fastify();
  fastify.register(fastifyPlugin, opts);

  const res = await fastify.inject({
    method: "GET",
    url: "/dataset/test-A/search?filter=a:foo",
    payload: undefined,
    headers: undefined,
  });
  expect(res.statusCode).toBe(200);
});

test("testing datasetItem", async (t) => {
  const fastify = Fastify();
  fastify.register(fastifyPlugin, opts);

  const res = await fastify.inject({
    method: "GET",
    url: "/dataset/test-A/item/0",
    payload: undefined,
    headers: undefined,
  });
  expect(res.statusCode).toBe(200);
});
