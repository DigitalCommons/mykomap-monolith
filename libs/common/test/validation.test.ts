/// <reference types="vitest"/>

import { expect, test } from "vitest";
import { schemas } from "@mykomap/common";

const { DatasetId, QName } = schemas;

test("testing DatasetId validation", async (t) => {
  const expectTrue = ["0", "A", "z", "_", "-", "01234", "Quick-Brown-Fox_42"];
  const expectFalse = ["", " ", "/", "?", "&", ":", ".", "="];
  expectTrue.forEach((it) =>
    expect(DatasetId.safeParse(it).success, `parsing '${it}'`).toBeTruthy(),
  );
  expectFalse.forEach((it) =>
    expect(DatasetId.safeParse(it).success, `parsing '${it}'`).toBeFalsy(),
  );
});

test("testing QName validation", async (t) => {
  const expectTrue = ["a:b", "a1:b1", "_:_", "_1-.:_1-."];
  const expectFalse = [
    "",
    ":",
    "a:",
    ":a",
    "_",
    "-",
    ".",
    "&",
    ";",
    "/",
    "1:",
    ":1",
    "a:1",
    "1:a",
    "-:-",
  ];
  expectTrue.forEach((it) =>
    expect(QName.safeParse(it).success, `parsing '${it}'`).toBeTruthy(),
  );
  expectFalse.forEach((it) =>
    expect(QName.safeParse(it).success, `parsing '${it}'`).toBeFalsy(),
  );
});
