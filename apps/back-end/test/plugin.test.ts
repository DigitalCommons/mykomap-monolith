/// <reference types="vitest"/>

import { expect, test, describe } from "vitest";
import Fastify from "fastify";
import fastifyPlugin from "../src/pluginApi";
import * as path from "node:path";
import { MykomapRouterConfig } from "../src/routes";

const opts: MykomapRouterConfig = {
  mykomap: {
    dataRoot: path.join(import.meta.dirname, "data"),
  },
};

const fastify = Fastify();
fastify.register(fastifyPlugin, opts);

// Note: see src/api/contract.ts in the @mykomap/common module for definitions
// and documentation of the API.

describe("getDatasetLocations", () => {
  describe("dataset exists", () => {
    test("status code 200 and locations returned", async (t) => {
      const res = await fastify.inject({
        method: "GET",
        url: "/dataset/dataset-A/locations",
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toStrictEqual([
        [-0.12783, 51.50748],
        [3.92473, 46.85045],
      ]);
    });
  });

  describe("dataset does not exist", () => {
    test("status code 404", async (t) => {
      const res = await fastify.inject({
        method: "GET",
        url: "/dataset/dataset-in-your-imagination/locations",
      });
      expect(res.statusCode).toBe(404);
    });
  });
});

describe("searchDataset", () => {
  describe("dataset exists", () => {
    test.each([
      "filter=country_id:GB:BMT20",
      "filter=country_id:GB:&text=pear",
      "filter=country+id:GB",
    ])("Malformed search query '%s' returns status code 400", async (query) => {
      const res = await fastify.inject({
        method: "GET",
        url: `/dataset/dataset-A/search?${query}`,
      });
      expect(res.statusCode).toBe(400);
    });

    test.each([
      "filter=organisational_structure:OS60",
      "filter=country_id:GB&filter=organisational_structure:OS60",
      "filter=made_up_prop:MUP1",
    ])(
      "Search query '%s' contains non-searchable prop so returns status code 400",
      async (query) => {
        const res = await fastify.inject({
          method: "GET",
          url: `/dataset/dataset-A/search?${query}`,
        });
        expect(res.statusCode).toBe(400);
      },
    );

    test.each([
      "filter=primary_activity:ICA210&filter=primary_activity:ICA220",
      "filter=country_id:FR&filter=primary_activity:ICA210",
      "text=blahblahblah",
      "filter=primary_activity:ICA210&text=blahblahblah",
    ])("Search query '%s' matches no items", async (query) => {
      const res = await fastify.inject({
        method: "GET",
        url: `/dataset/dataset-A/search?${query}`,
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toStrictEqual([]);
    });

    test.each([
      "filter=country_id:GB",
      "filter=country_id:GB&filter=typology:BMT20",
      "filter=country_id:GB&filter=typology:BMT20",
      "text=1+West+Street",
      "filter=country_id:GB&text=1+West+Street",
    ])("Search query '%s' matches only item 0", async (query) => {
      const res = await fastify.inject({
        method: "GET",
        url: `/dataset/dataset-A/search?${query}`,
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toStrictEqual(["@0"]);
    });

    test.each([
      "filter=primary_activity:ICA230",
      "text=pears.coop",
      "text=pears+coop",
    ])("Search query '%s' matches only item 1", async (query) => {
      const res = await fastify.inject({
        method: "GET",
        url: `/dataset/dataset-A/search?${query}`,
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toStrictEqual(["@1"]);
    });

    test.each(["filter=typology:BMT20", "text=coop"])(
      "Search query '%s' matches item 0 and 1",
      async (query) => {
        const res = await fastify.inject({
          method: "GET",
          url: `/dataset/dataset-A/search?${query}`,
        });
        expect(res.statusCode).toBe(200);
        expect(res.json()).toStrictEqual(["@0", "@1"]);
      },
    );
  });

  describe("dataset does not exist", () => {
    test("status code 404", async (t) => {
      const res = await fastify.inject({
        method: "GET",
        url: "/dataset/dataset-in-your-imagination/search?filter=a:foo",
      });
      expect(res.statusCode).toBe(404);
    });
  });
});

describe("getDatasetItem", () => {
  describe("dataset exists", () => {
    describe("item exists", () => {
      test("status code 200 and non-empty response", async (t) => {
        const res = await fastify.inject({
          method: "GET",
          url: "/dataset/dataset-A/item/@0",
        });
        expect(res.statusCode).toBe(200);
        expect(res.json()).toBeTypeOf("object");
        expect(res.json()).toHaveProperty("name");
      });
    });

    describe("item doesn't exist", () => {
      test("status code 404", async (t) => {
        const res = await fastify.inject({
          method: "GET",
          url: "/dataset/dataset-A/item/@999",
        });
        expect(res.statusCode).toBe(404);
      });
    });
  });

  describe("dataset does not exist", () => {
    test("status code 404", async (t) => {
      const res = await fastify.inject({
        method: "GET",
        url: "/dataset/dataset-in-your-imagination/item/@0",
      });
      expect(res.statusCode).toBe(404);
    });
  });
});

describe("getConfig", () => {
  describe("dataset exists", () => {
    test("status code 200 and non-empty response", async (t) => {
      const res = await fastify.inject({
        method: "GET",
        url: "/dataset/dataset-A/config",
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toBeTypeOf("object");
      expect(res.json()).toHaveProperty("vocabs");
    });
  });

  describe("dataset does not exist", () => {
    test("status code 404", async (t) => {
      const res = await fastify.inject({
        method: "GET",
        url: "/dataset/dataset-in-your-imagination/config",
      });
      expect(res.statusCode).toBe(404);
    });
  });
});

describe("getVersion", () => {
  test("status code 200 and non-empty response", async (t) => {
    const res = await fastify.inject({
      method: "GET",
      url: "/version",
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toBeTypeOf("object");
    expect(res.json()).toHaveProperty("version");
  });
});
