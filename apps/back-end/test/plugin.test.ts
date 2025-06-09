/// <reference types="vitest"/>

import { expect, test, describe } from "vitest";
import Fastify from "fastify";
import qs from "qs";
import * as path from "node:path";
import fastifyPlugin from "../src/pluginApi";
import { MykomapRouterConfig } from "../src/routes";

const opts: MykomapRouterConfig = {
  mykomap: {
    dataRoot: path.join(import.meta.dirname, "data"),
  },
};

const fastify = Fastify({ querystringParser: (str) => qs.parse(str) });
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
        null,
        [150.523326, -34.731596],
        [150.525, -34.735],
        [-0.12783, 51.52],
        [-0.12783, 51.52],
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
      "filter=country_id:GB&filter=typology:BMT20",
      "text=West+Street",
      "filter=country_id:GB&text=West+Street",
    ])("Search query '%s' matches only item 0", async (query) => {
      const res = await fastify.inject({
        method: "GET",
        url: `/dataset/dataset-A/search?${query}`,
      });
      expect(res.statusCode).toBe(200);
      expect(res.json()).toStrictEqual(["@0", "@5", "@6"]);
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
        expect(res.json()).toStrictEqual(["@0", "@1", "@5", "@6"]);
      },
    );

    test.each(["returnProps[]=name&page=0&pageSize=2"])(
      "Paginated search query '%s' returns the first 2 items",
      async (query) => {
        const res = await fastify.inject({
          method: "GET",
          url: `/dataset/dataset-A/search?${query}`,
        });
        expect(res.statusCode).toBe(200);
        expect(res.json()).toStrictEqual([
          { index: "@0", name: "Apples Co-op" },
          { index: "@1", name: "Pears United" },
        ]);
      },
    );

    test.each(["returnProps[]=name&page=1&pageSize=6"])(
      "Unconstrained paginated search query '%s' returns the final item",
      async (query) => {
        const res = await fastify.inject({
          method: "GET",
          url: `/dataset/dataset-A/search?${query}`,
        });
        expect(res.statusCode).toBe(200);
        expect(res.json()).toStrictEqual([
          { index: "@6", name: "North Apples Co-op 2" },
        ]);
      },
    );

    test.each(["returnProps[]=name&page=1&pageSize=2"])(
      "Unconstrained paginated search query '%s' returns the second page items",
      async (query) => {
        const res = await fastify.inject({
          method: "GET",
          url: `/dataset/dataset-A/search?${query}`,
        });
        expect(res.statusCode).toBe(200);
        expect(res.json()).toStrictEqual([
          { index: "@2", name: "Invisible Collab" },
          { index: "@3", name: "Kangaroo Koop" },
        ]);
      },
    );

    test.each(["returnProps[]=name&page=2&pageSize=1&filter=country_id:GB"])(
      "Filtering paginated search query '%s' returns the second page items",
      async (query) => {
        const res = await fastify.inject({
          method: "GET",
          url: `/dataset/dataset-A/search?${query}`,
        });
        expect(res.statusCode).toBe(200);
        expect(res.json()).toStrictEqual([
          { index: "@5", name: "North Apples Co-op" },
        ]);
      },
    );

    test.each(["returnProps[]=name&page=1&pageSize=1&text=apples"])(
      "Matching paginated search query '%s' returns the second page items",
      async (query) => {
        const res = await fastify.inject({
          method: "GET",
          url: `/dataset/dataset-A/search?${query}`,
        });
        expect(res.statusCode).toBe(200);
        expect(res.json()).toStrictEqual([
          { index: "@5", name: "North Apples Co-op" },
        ]);
      },
    );

    // Note: pageSize=0 is prevented by the contract requiring it to be positive
    // (gets a 400 error)
    test.each([
      "returnProps[]=name",
      "returnProps[]=name&pageSize=2",
      "returnProps[]=name&page=0",
      "returnProps[]=name&page=1",
    ])(
      "Search query '%s' with unspecified pagination params returns all items",
      async (query) => {
        const res = await fastify.inject({
          method: "GET",
          url: `/dataset/dataset-A/search?${query}`,
        });
        expect(res.statusCode).toBe(200);
        expect(res.json()).toStrictEqual([
          { index: "@0", name: "Apples Co-op" },
          { index: "@1", name: "Pears United" },
          { index: "@2", name: "Invisible Collab" },
          { index: "@3", name: "Kangaroo Koop" },
          { index: "@4", name: "Koala Koop" },
          { index: "@5", name: "North Apples Co-op" },
          { index: "@6", name: "North Apples Co-op 2" },
        ]);
      },
    );

    test.each([
      "page=-1&pageSize=2",
      "page=1&pageSize=0",
      "page=0.5&pageSize=2",
      "page=1&pageSize=1.5",
    ])(
      "Paginated search query '%s' with bad params returns status code 400",
      async (query) => {
        const res = await fastify.inject({
          method: "GET",
          url: `/dataset/dataset-A/search?${query}`,
        });
        expect(res.statusCode).toBe(400);
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

describe("getAbout", () => {
  describe("dataset exists", () => {
    test("status code 200 and non-empty response", async (t) => {
      const res = await fastify.inject({
        method: "GET",
        url: "/dataset/dataset-A/about",
      });
      expect(res.statusCode).toBe(200);
      expect(res.body).toContain("published by Mr Douglas Quaid");
    });
  });

  describe("dataset does not exist", () => {
    test("status code 404", async (t) => {
      const res = await fastify.inject({
        method: "GET",
        url: "/dataset/dataset-in-your-imagination/about",
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
