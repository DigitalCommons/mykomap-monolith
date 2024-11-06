/// <reference types="vitest"/>

import { expect, test } from "vitest";
import { ImportCmd } from "../src/cli/dataset.js";

import { rmSync } from "node:fs";
import { join } from "node:path";
import { Result, compareSync, fileCompareHandlers } from "dir-compare";

import { BaseContext, Cli, CommandClass } from "clipanion";

const compareOptions = {
  compareFileSync: fileCompareHandlers.lineBasedFileCompare.compareSync,
  compareFileAsync: fileCompareHandlers.lineBasedFileCompare.compareAsync,
  compareContent: true,
  ignoreLineEnding: false,
  ignoreWhiteSpaces: false,
  ignoreAllWhiteSpaces: false,
  ignoreEmptyLines: false,
};

// Remove this temp output directory
rmSync("test/tmp", { recursive: true, force: true });

// Run the command in a test harness
async function runTest(cmd: CommandClass<BaseContext>) {
  const [node, app] = process.argv;
  const args = [
    "import",
    "test/data/dataset-cli/config.json",
    "test/data/dataset-cli/dummy.csv",
    "test/tmp/dummy",
  ];

  const cli = new Cli({
    binaryLabel: `Test Application`,
    binaryName: `${node} ${app}`,
    binaryVersion: `1.0.0`,
  });

  cli.register(cmd);
  return cli.run(args);
}

// Unpack and display the diff result
function print(result: Result) {
  console.log("Directories are %s", result.same ? "identical" : "different");

  console.log(
    "Statistics - equal entries: %s, distinct entries: %s, left only entries: %s, right only entries: %s, differences: %s",
    result.equal,
    result.distinct,
    result.left,
    result.right,
    result.differences,
  );

  result.diffSet.forEach((dif) =>
    console.log(
      `Difference:\n` +
        `state: %s\n` +
        `  produced file: %s\n` +
        `      size: %d B; type: %s\n` +
        `  expected file: %s\n` +
        `      size: %d B; type: %s\n`,
      dif.state,
      dif.size1 === undefined ? "-" : join(dif.path1, dif.name1),
      dif.size1,
      dif.type1,
      dif.size2 === undefined ? "-" : join(dif.path2, dif.name2),
      dif.size2,
      dif.type2,
    ),
  );
}

test("testing dataset import", async (t) => {
  let result: number | undefined;
  try {
    result = await runTest(ImportCmd);
  } catch (e) {}
  expect(result).toBe(0);
  const comparison = compareSync(
    "test/tmp/dummy",
    "test/data/dataset-cli/expected/dummy",
    compareOptions,
  );

  if (!comparison.same) print(comparison);
  expect(comparison.same).toBeTruthy();
});
