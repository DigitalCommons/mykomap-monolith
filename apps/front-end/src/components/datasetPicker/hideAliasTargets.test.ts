import { expect, test } from "vitest";
import { hideAliasTargets } from "./hideAliasTargets";

test("a dataset that an alias points at is not listed separately", () => {
  const entries = [
    { id: "cwm-20260623", label: "CWM" },
    { id: "cwm-latest", label: "CWM", aliasOf: "cwm-20260623" },
    { id: "powys-eng", label: "Powys" },
  ];

  expect(hideAliasTargets(entries)).toStrictEqual([
    { id: "cwm-latest", label: "CWM", aliasOf: "cwm-20260623" },
    { id: "powys-eng", label: "Powys" },
  ]);
});

test("two aliases of the same dataset are both listed", () => {
  const entries = [
    { id: "cwm-20260930", label: "CWM" },
    { id: "cwm-dev", label: "CWM", aliasOf: "cwm-20260930" },
    { id: "cwm-latest", label: "CWM", aliasOf: "cwm-20260930" },
  ];

  expect(hideAliasTargets(entries).map((e) => e.id)).toStrictEqual([
    "cwm-dev",
    "cwm-latest",
  ]);
});

test("an alias whose target is not listed is kept", () => {
  const entries = [{ id: "cwm-latest", label: "CWM", aliasOf: "cwm-gone" }];

  expect(hideAliasTargets(entries)).toStrictEqual(entries);
});
