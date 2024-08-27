// implementation of the operations in the openapi specification

export class Service {

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
    console.log("dataset", req.params);
    return { key: "value" };
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
    console.log("datasetSearch", req.params);
    return { key: "value" };
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
    console.log("datasetItem", req.params);
    return { key: "value" };
  }
}
