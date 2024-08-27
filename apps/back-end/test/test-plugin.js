// this file contains a test harness that was auto-generated by fastify-openapi-glue
// running the tests directly after generation will probably fail as the parameters
// need to be manually added.

import { strict as assert } from "node:assert/strict";
import { test } from "node:test";
import Fastify from "fastify";
import fastifyPlugin from "../index.js";
import service from "../service.js";

const specification = "../openApi.json";

const opts = {
	specification,
	service,
};
//
// Operation: dataset
// URL: /dataset/:datasetId
// summary:	obtains a dataset
// req.params
//   type: object
//   properties:
//     datasetId:
//       type: string
//       description: uniquely specifies the dataset wanted
//   required:
//     - datasetId
//
// valid responses
//   '200':
//     description: the dataset matching the supplied criteria
//     content:
//       application/json:
//         schema:
//           type: array
//           items:
//             maxItems: 2
//             minItems: 2
//             type: array
//             items:
//               type: number
//               format: float32
//   '400':
//     description: bad input parameter
//   '404':
//     description: no such dataset
//

test("testing dataset", async (t) => {
	const fastify = Fastify();
	fastify.register(fastifyPlugin, opts);

	const res = await fastify.inject({
		method: "GET",
		url: "/dataset/:datasetId",
		payload: undefined,
		headers: undefined,
	});
	assert.equal(res.statusCode, 200);
});

// Operation: datasetSearch
// URL: /dataset/:datasetId/search
// summary:	obtains a list of dataset entries satisfying the search criteria supplied
// req.params
//   type: object
//   properties:
//     datasetId:
//       type: string
//       description: uniquely specifies the dataset wanted
//   required:
//     - datasetId
//
// req.query
//   type: object
//   properties:
//     text:
//       type: string
//       description: a text fragment to match
//     filter:
//       type: array
//       items:
//         type: string
//       description: uniquely specifies the taxonomy filter items wanted
//
// valid responses
//   '200':
//     description: the dataset IDs matching the supplied criteria
//     content:
//       application/json:
//         schema:
//           type: array
//           items:
//             type: string
//             description: uniquely specifies the dataset item wanted
//   '400':
//     description: bad input parameter
//   '404':
//     description: no such dataset
//

test("testing datasetSearch", async (t) => {
	const fastify = Fastify();
	fastify.register(fastifyPlugin, opts);

	const res = await fastify.inject({
		method: "GET",
		url: "/dataset/:datasetId/search",
		payload: undefined,
		headers: undefined,
	});
	assert.equal(res.statusCode, 200);
});

// Operation: datasetItem
// URL: /dataset/:datasetId/item/:datasetItemId
// summary:	obtains a dataset item by its  unique ID
// req.params
//   type: object
//   properties:
//     datasetId:
//       type: string
//       description: uniquely specifies the dataset wanted
//     datasetItemId:
//       type: string
//       description: uniquely specifies the dataset item wanted
//   required:
//     - datasetId
//     - datasetItemId
//
// valid responses
//   '200':
//     description: the dataset item matching the supplied criteria
//     content:
//       application/json:
//         schema:
//           type: object
//   '400':
//     description: bad input parameter
//   '404':
//     description: no such dataset item
//

test("testing datasetItem", async (t) => {
	const fastify = Fastify();
	fastify.register(fastifyPlugin, opts);

	const res = await fastify.inject({
		method: "GET",
		url: "/dataset/:datasetId/item/:datasetItemId",
		payload: undefined,
		headers: undefined,
	});
	assert.equal(res.statusCode, 200);
});
