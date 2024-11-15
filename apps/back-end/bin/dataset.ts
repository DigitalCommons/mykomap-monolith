#!/usr/bin/env tsx

import { Builtins, Cli } from "clipanion";
import { ImportCmd } from "@mykomap/back-end/src/cli/dataset.js";
import { relative } from "node:path";

const [_, app, ...args] = process.argv;

const cli = new Cli({
  binaryLabel: `Mykomap datasets tool`,
  binaryName: `tsx ${relative(process.cwd(), app)}`,
  //  binaryVersion: __BUILD_INFO__, // Not sure how to get this without duplication
});

[ImportCmd, Builtins.HelpCommand].forEach((cmd) => cli.register(cmd));

/** Parse the CLI, maybe run a command */
cli.runExit(args);
