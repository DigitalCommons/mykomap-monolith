# API

The Mykomap API is used by front-end clients to interact with the back-end server.

## ts-rest

We define and implement the API using a lightweight library called [ts-rest](https://ts-rest.com/).

The API is defined by the [`contract.ts`](https://github.com/DigitalCommons/mykomap-monolith/tree/main/libs/common/src/api/contract.ts){target="\_blank"} file in the
`@mykomap/common` library. In the contract, we list the API routes, including details about the
requests (e.g. query parameters) and responses and their types (using
[Zod](https://zod.dev/?id=introduction) schemas).

In the front-end and back-end, we use the `ts-rest` client and server libraries respectively. They
consume the `contract.ts` and provide fully type-safe API methods in Typescript, with runtime
validation based on the Zod schemas.

From the `contract.ts`, we can also generate an OpenAPI spec, using the
[`generate-openapi`](https://github.com/DigitalCommons/mykomap-monolith/tree/main/libs/common/src/api/generate-openapi.ts){target="\_blank"} script.
