import { Launcher } from "./src/index.js";

// Workaround to avoid 'Error: Dynamic require of "os" is not supported'.
// Adapted from:
// https://github.com/evanw/esbuild/issues/1921#issuecomment-3453406735
// This appears to be a bug? Although Vite uses Rollup instead of esbuild,
// this trick of defining a require function still seems to work.
import { createRequire } from "module";
global.require = createRequire(import.meta.url);

Launcher.start();
