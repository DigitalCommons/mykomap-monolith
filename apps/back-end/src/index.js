// Fastify plugin autogenerated by fastify-openapi-glue
import openapiGlue from "fastify-openapi-glue";
import dotenv from "dotenv";
import { Security } from "./security.js";
import { Service } from "./service.js";
import specification from "@mykomap/common";

dotenv.config();

const serviceOptions = {
  dataRoot: process.env.SERVER_DATA_ROOT ?? 'data',
};


export default async function (fastify, opts) {
  const pluginOptions = {
    specification,
    serviceHandlers: new Service({
      options: opts.serviceOptions,
    }),
    securityHandlers: new Security(),
  };
  fastify.register(openapiGlue, { ...pluginOptions, ...opts });
}

export const options = {
  serviceOptions,
  ajv: {
    customOptions: {
      strict: false,
    },
  },
};
