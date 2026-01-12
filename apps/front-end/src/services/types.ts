import { ClientInferResponseBody } from "@ts-rest/core";
import { contract } from "@mykomap/common";

export type Config = ClientInferResponseBody<typeof contract.getConfig, 200>;
