/// <reference types="vitest"/>

import { expect, test } from "vitest";
import {
  slurp,
  slurpJson,
  slurpJsonSync,
  slurpSync,
} from "../src/file-utils.js";

import { rmSync } from "node:fs";
import { join } from "node:path";

const dataDir = join(import.meta.dirname, "data/file-utils");

// Remove this temp output directory
rmSync("test/tmp", { recursive: true, force: true });

test("testing slurp", async (t) => {
  const file = join(dataDir, "dummy.json");
  const result = await slurp(file);
  expect(result).toEqual('{ "hello": "world" }\n');
});

test("testing slurpSync", async (t) => {
  const file = join(dataDir, "dummy.json");
  const result = slurpSync(file);
  expect(result).toEqual('{ "hello": "world" }\n');
});

test("testing slurpJson", async (t) => {
  const file = join(dataDir, "dummy.json");
  const result = await slurpJson(file);
  expect(result).toEqual({ hello: "world" });
});

test("testing slurpJsonSync", async (t) => {
  const file = join(dataDir, "dummy.json");
  const result = slurpJsonSync(file);
  expect(result).toEqual({ hello: "world" });
});
