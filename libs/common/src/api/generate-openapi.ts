import fs from "node:fs";
import path from "node:path";
import { generateOpenApi } from "@ts-rest/open-api";

import { contract } from "./contract.js";

// This is a script that generates an OpenAPI document in mykomap-openapi.json from our ts-rest
// contract.

const openApiDocument = generateOpenApi(
  contract,
  {
    info: {
      title: "Mykomap basic data and search API",
      description: "This is a basic API for Mykomap application clients",
      contact: {
        email: "hello@digitalcommons.coop",
      },
      license: {
        name: "Apache 2.0",
        url: "http://www.apache.org/licenses/LICENSE-2.0.html",
      },
      version: "0.1.0",
    },
  },
  {
    setOperationId: "concatenated-path",
  },
);

fs.writeFileSync(
  path.resolve(__dirname, "./mykomap-openapi.json"),
  JSON.stringify(openApiDocument, null, 2),
);
