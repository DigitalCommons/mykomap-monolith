/// <reference types="vitest"/>

import { expect, test } from "vitest";
import { schemas } from "@mykomap/common";

const { DatasetId, QName, PrefixUri, Iso639Set1Code } = schemas;

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

test("testing PrefixUri validation", async (t) => {
  const expectTrue = [
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
  ];
  const expectFalse = [
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
  ];

  expectTrue.forEach((it) =>
    expect(PrefixUri.safeParse(it).success, `parsing '${it}'`).toBeTruthy(),
  );
  expectFalse.forEach((it) =>
    expect(PrefixUri.safeParse(it).success, `parsing '${it}'`).toBeFalsy(),
  );
});

test("testing Iso639Set1Code validation", async (t) => {
  const expectTrue = ["en", "fr", "ko", "es"];
  const expectFalse = [
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
  ];
  expectTrue.forEach((it) =>
    expect(
      Iso639Set1Code.safeParse(it).success,
      `parsing '${it}'`,
    ).toBeTruthy(),
  );
  expectFalse.forEach((it) =>
    expect(Iso639Set1Code.safeParse(it).success, `parsing '${it}'`).toBeFalsy(),
  );
});
