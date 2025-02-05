import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const path = fileURLToPath(import.meta.url);
const root = dirname(path);

// Parse a simple-minded version tag, if found. Expect a 'v' followed by
// dot-delimited decimal integer strings. But only loose matches for versiony-looking
// tags starting with 'v' and a number are possible with --match.  Convert this into
// an array of numbers. If versionStr is "" or undefined, we get [0].
const versionStr = spawnSync("git", [
  "describe",
  "--tags",
  "--match=v[0-9]*",
  "--abbrev=0",
])
  ?.stdout?.toString()
  .trim();
const version =
  typeof versionStr === "string"
    ? versionStr.substring(1).split(".").map(Number)
    : [0];

// Get the git-describe commit information for a more discerning audience.
// The result will be a string with the format: "[<TAG>-<COUNT>-]<COMMIT-ID>[-dirty]"
// - Items in square brackets may be absent.
// - TAG is the last tag found in the commit history, if there is one.
// - COUNT is the number of commts from the tag to the current commit.
// - COMMIID is the abbreviated SHA1 commit ID.
// - A "dirty" suffix indicates a build in a dirty working directory.
// - Note that TAG may contain any character a tag can, including a hyphen.
// - Therefore it might not be a version string.
//
const commitDesc = spawnSync("git", [
  "describe",
  "--tags",
  "--always",
  "--long",
  "--dirty",
])
  ?.stdout?.toString()
  .trim();

// Get the Vite env mode. This should typechecking, but seems not to be?
//const envMode = envMode: import.meta.env.MODE ?? '';

const buildInfo = {
  name: "mykomap-api",
  buildTime: new Date().toISOString(), // should be UTC
  version,
  commitDesc,
  //  envMode,
  nodeEnv: process.env.NODE_ENV ?? "",
};

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_INFO__: buildInfo,
  },
  plugins: [dts()],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: fileURLToPath(import.meta.resolve("./src/index.ts")),
      name: "@mykomap/back-end",
      formats: ["es"],
      fileName: "back-end",
    },
  },
  server: {
    open: true,
  },
  test: {
    globals: true,
    environment: "node",
    mockReset: true,
  },
  base: "./",
  root,
});
