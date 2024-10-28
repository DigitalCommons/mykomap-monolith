/// <reference types="vitest"/>

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

test("testing getDatasetLocations", async (t) => {
  const fastify = Fastify();
  fastify.register(fastifyPlugin, opts);

  const res = await fastify.inject({
    method: "GET",
    url: "/dataset/dataset-A/locations",
    payload: undefined,
    headers: undefined,
  });
  expect(res.statusCode).toBe(200);
});

test("testing searchDataset", async (t) => {
  const fastify = Fastify();
  fastify.register(fastifyPlugin, opts);

  const res = await fastify.inject({
    method: "GET",
    url: "/dataset/dataset-A/search?filter=a:foo",
    payload: undefined,
    headers: undefined,
  });
  expect(res.statusCode).toBe(200);
});

test("testing getDatasetItem", async (t) => {
  const fastify = Fastify();
  fastify.register(fastifyPlugin, opts);

  const res = await fastify.inject({
    method: "GET",
    url: "/dataset/dataset-A/item/0",
    payload: undefined,
    headers: undefined,
  });
  expect(res.statusCode).toBe(200);
});

test("testing getConfig", async (t) => {
  const fastify = Fastify();
  fastify.register(fastifyPlugin, opts);

  const res = await fastify.inject({
    method: "GET",
    url: "/dataset/dataset-A/config",
    payload: undefined,
    headers: undefined,
  });
  expect(res.statusCode).toBe(200);
});

test("testing getVersion", async (t) => {
  const fastify = Fastify();
  fastify.register(fastifyPlugin, opts);

  const res = await fastify.inject({
    method: "GET",
    url: "/version",
    payload: undefined,
    headers: undefined,
  });
  expect(res.statusCode).toBe(200);
});
