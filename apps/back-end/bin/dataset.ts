#!/usr/bin/env tsx

import { runExit } from "clipanion";
import { ImportCmd } from "@mykomap/back-end/src/cli/dataset.js";

/** Parse the CLI, maybe run these command */
runExit([ImportCmd]);
