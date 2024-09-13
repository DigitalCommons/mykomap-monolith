// implementation of the operations in the openapi specification
import { FastifyReply, FastifyRequest } from "fastify";
import fs from "node:fs";
import path from "node:path";

// Helper functions

function assertBase64(value: string, errorMsg: string): void {
  if (!value.match(/^[A-Z0-9_-]+$/i))
    // URL-safe base64 (RFC4648 sect 5)
    throw new Error(errorMsg);
}

function assertQName(value: string, errorMsg: string): void {
  // Not quite a full qname check but it'll do for now
  if (!value.match(/^[A-Z0-9_-]+:[A-Z0-9_-]+$/i))
    // two base64 uris joined with ':'
    throw new Error(errorMsg);
}

function assertPathExists(value: string, errorMsg: string): void {
  if (!fs.existsSync(value)) throw new Error(errorMsg);
}

// Validates a query parameters / parameters of a FastifyRequest, and returns
// the result, or a default value.
//
// If given, the default value avoids the absence of the named property
// raising an error.  A default value of `null` will allow nulls or undefined values.
//
// The returned value could still be some other type in principle, so
// you still need to check or coerce it at runtime on return, even if there is a default.
function getValue(
  req: FastifyRequest,
  which: "params" | "query",
  prop: string,
  defaultValue: unknown = undefined,
): unknown {
  let value: unknown;
  if (typeof req[which] === "object") {
    const values = req[which] as Record<string, unknown>;
    value = values[prop];
  }
  if (value !== undefined && value !== null) return value;

  if (defaultValue === undefined)
    throw new Error("no datasetId parameter found in request");

  return defaultValue;
}

export interface ServiceOptions {
  // The path to the root directory of the canned data to use
  dataRoot?: string;
}

// Service route implementations
export class Service {
  public readonly options: ServiceOptions;

  constructor({ options }: { options?: ServiceOptions } = {}) {
    //{ options: ServiceOptions = {} }) {
    this.options = options ?? {};

    // Validation
    if (this.options.dataRoot == undefined)
      // deliberately loose check
      throw new Error("mandatory dataRoot option is not defined");

    if (!fs.existsSync(this.options.dataRoot))
      throw new Error(
        `defined dataRoot option refers to non-existing path: '${this.options.dataRoot}'`,
      );
  }

  _sendJson(
    req: FastifyRequest,
    reply: FastifyReply,
    components: Array<string>,
    errorMsg: string,
  ) {
    const dataPath =
      path.join(this.options.dataRoot ?? "", ...components) + ".json";
    req.log.debug(`dataPath is '${dataPath}`);
    assertPathExists(dataPath, errorMsg);

    const stream = fs.createReadStream(dataPath, "utf8");
    reply.header("Content-Type", "application/json");
    reply.send(stream);

    return reply;
  }

  // Operation: dataset
  // URL: /dataset/:datasetId
  // summary:  obtains a dataset
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
  async dataset(req: FastifyRequest, reply: FastifyReply) {
    const datasetId = String(getValue(req, "params", "datasetId"));
    assertBase64(datasetId, `invalid datasetId`);

    return this._sendJson(
      req,
      reply,
      ["datasets", datasetId],
      `unknown datasetId`,
    );
  }

  // Operation: datasetSearch
  // URL: /dataset/:datasetId/search
  // summary:  obtains a list of dataset entries satisfying the search criteria supplied
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

  async datasetSearch(req: FastifyRequest, reply: FastifyReply) {
    const datasetId = String(getValue(req, "params", "datasetId"));
    const filter = getValue(req, "query", "filter", []);
    const text = String(getValue(req, "query", "text", ""));

    assertBase64(datasetId, `invalid datasetId`);

    // Partly this is here to make TS happy...
    const filter2 = filter instanceof Array ? filter : [filter];

    filter2.forEach((uri) => assertQName(uri, `invalid filter`));

    const encodedText = encodeURIComponent(text);

    return this._sendJson(
      req,
      reply,
      ["datasets", datasetId, "search", ...filter2, "text", encodedText],
      `search failed`,
    );
  }

  // Operation: datasetItem
  // URL: /dataset/:datasetId/item/:datasetItemId
  // summary:  obtains a dataset item by its  unique ID
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

  async datasetItem(req: FastifyRequest, reply: FastifyReply) {
    const datasetId = String(getValue(req, "params", "datasetId"));
    const datasetItemId = String(getValue(req, "params", "datasetItemId"));

    assertBase64(datasetId, `invalid datasetId`);
    assertBase64(datasetItemId, `invalid datasetItemId`);

    return this._sendJson(
      req,
      reply,
      ["datasets", datasetId, "items", datasetItemId],
      `item retrieve failed`,
    );
  }
}
