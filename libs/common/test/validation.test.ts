/// <reference types="vitest"/>

import { expect, test, Assertion } from "vitest";
import { schemas } from "../src/index.js";
import { ZodType } from "zod";
import { slurpJsonSync } from "./file-utils.js";
import { globSync } from "glob";
import { join } from "node:path";

const { DatasetId, QName, PrefixUri, Iso639Set1Code, ConfigData } = schemas;

/** Creates expectations on validating each of an array of cases
 *
 * Mainly here to provide the common part of expectValid and expectInvalid.
 */
function expectSafeParse<Z extends ZodType>(
  validation: Z,
  cases: unknown[],
  expectTest: (assert: Assertion<boolean>) => void,
) {
  cases.forEach((it) => {
    const result = validation.safeParse(it);
    expectTest(expect(result.success, `parsing '${it}'...\n${result.error}`));
  });
}

/** Expect Zod validations of each of the cases given to be truthy */
function expectValid<Z extends ZodType>(validation: Z, cases: unknown[]) {
  expectSafeParse(validation, cases, (a) => a.toBeTruthy());
}

/** Expect Zod validations of each of the cases given to be falsy */
function expectInvalid<Z extends ZodType>(validation: Z, cases: unknown[]) {
  expectSafeParse(validation, cases, (a) => a.toBeFalsy());
}

/** Find files given by a glob and parse as JSON */
function glorpJson(pathGlob: string) {
  const paths = globSync(pathGlob).map((path) =>
    join(import.meta.dirname, path),
  );
  return paths.map((path) => slurpJsonSync(path));
}

test("testing DatasetId validation", async (t) => {
  expectValid(DatasetId, [
    "0",
    "A",
    "z",
    "_",
    "-",
    "01234",
    "Quick-Brown-Fox_42",
  ]);
  expectInvalid(DatasetId, ["", " ", "/", "?", "&", ":", ".", "="]);
});

test("testing QName validation", async (t) => {
  expectValid(QName, ["a:b", "a1:b1", "_:_", "_1-.:_1-."]);
  expectInvalid(QName, [
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
  ]);
});

test("testing PrefixUri validation", async (t) => {
  expectValid(PrefixUri, [
    "http://a",
    "http://a/",
    "http://e.a",
    "http://e.a/",
    "http://example.com",
    "http://EXAMPLE.COM",
    "http://example.Com",
    "https://example.com",
    "http://www.example.com",
    "http://www.example.com/",
    "https://w3-example/",
    "https://w3-example1.com/",
    "http://example.com#",
    "http://example.com/#",
    "http://example.com/foo",
    "http://example.com/foo/",
    "http://example.com/foo/bar",
    "http://example.com/foo/bar/",
    "http://example.com/foo#",
    "http://example.com/foo/#",
    "http://example.com/foo/bar#",
    "http://example.com/foo/bar/#",
    "http://example.com/%2e%4F",
    "http://example.com/A-Za-z0-9._~!$&'()*+,;=:@-%20/",
  ]);
  expectInvalid(PrefixUri, [
    "http://",
    "http://-",
    "http://.",
    "http://.a",
    "http://-a",
    "http://a-",
    "http://a.",
    "http://3a.com",
    "http://a.3com",
    "http://-a.com",
    "http://a-.com",
    "http://a.-com",
    "http://a.-com",
    "http://a.com-",
    "http://a_b",
    "http://a_b.c",
    "http://a@b",
    "http://a@b.c",
    "http://a:b.c",
    "http://b.c:8000",
    "HTTP://example.com",
    "Http://example.com",
    "htt://example.com",
    "httpss://example.com",
    "http//example.com",
    "http:/example.com",
    "http:///example.com",
    "http//:/example.com",
    "http/example.com",
    "http/:example.com",
    "http//:example.com",
    "http://example.com?",
    "http://example.com/?",
    "http://example.com?q",
    "http://example.com/?q",
    "http://example.com/foo?q",
    "http://example.com/foo/?q",
    "http://example.com/#?",
    "http://example.com#?",
    "http://example.com#q",
    "http://example.com/#q",
    'http://example.com/foo"bar',
    "http://example.com//foobar",
    "http://example.com/foo//bar",
    "http://example.com/foobar//",
  ]);
});

test("testing Iso639Set1Code validation", async (t) => {
  expectValid(Iso639Set1Code, ["en", "fr", "ko", "es"]);
  expectInvalid(Iso639Set1Code, [
    "xe",
    "En",
    "eN",
    "EN",
    "enn",
    "en ",
    " en",
    "e ",
    "e n",
    " ",
    "e_",
    "_e",
    "e-",
    "-e",
    "__",
    "--",
    "'en'",
    "en:",
    "e:",
  ]);
});

test("testing ConfigData validation", async (t) => {
  expectValid(ConfigData, glorpJson("data/validation/vocabIndex/*.good.json"));
  expectInvalid(ConfigData, glorpJson("data/validation/vocabIndex/*.bad.json"));
});
