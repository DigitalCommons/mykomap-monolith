// @ts-nocheck
// implementation of the operations in the openapi specification
import fs from "node:fs";
import path from "node:path";

// Helper functions

function assertBase64(value, errorMsg) {
  if (!value.match(/^[A-Z0-9_-]+$/i))
    // URL-safe base64 (RFC4648 sect 5)
    throw new Error(errorMsg);
}

function assertQName(value, errorMsg) {
  // Not quite a full qname check but it'll do for now
  if (!value.match(/^[A-Z0-9_-]+:[A-Z0-9_-]+$/i))
    // two base64 uris joined with ':'
    throw new Error(errorMsg);
}

function assertPathExists(value, errorMsg) {
  if (!fs.existsSync(value)) throw new Error(errorMsg);
}

// Service route implementations
export class Service {
  constructor({ options = {} }) {
    this.options = options;

    // Validation
    if (options.dataRoot == undefined)
      // deliberately loose check
      throw new Error("mandatory dataRoot option is not defined");

    if (!fs.existsSync(options.dataRoot))
      throw new Error(
        `defined dataRoot option refers to non-existing path: '${options.dataRoot}'`,
      );
  }

  _sendJson(req, reply, components, errorMsg) {
    const dataPath = path.join(this.options.dataRoot, ...components) + ".json";
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

  async dataset(req, reply) {
    const id = req.params.datasetId;
    assertBase64(id, `invalid datasetId`);

    return this._sendJson(req, reply, ["datasets", id], `unknown datasetId`);
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

  async datasetSearch(req, reply) {
    const { datasetId } = req.params;
    const { filter, text } = req.query;

    assertBase64(datasetId, `invalid datasetId`);
    filter?.forEach((uri) => assertQName(uri, `invalid filter`));

    const encodedText = encodeURIComponent(text ?? "");

    return this._sendJson(
      req,
      reply,
      ["datasets", datasetId, "search", ...(filter ?? []), "text", encodedText],
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

  async datasetItem(req, reply) {
    const { datasetId, datasetItemId } = req.params;

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
