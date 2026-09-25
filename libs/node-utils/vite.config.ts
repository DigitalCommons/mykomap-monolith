import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";
import { changelogVersion, ReadonlyBuildInfo } from "@mykomap/common";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import pkg from "./package.json" with { type: "json" };

// Get the Vite env mode. This should typechecking, but seems not to be?
//const envMode = envMode: import.meta.env.MODE ?? '';

// Get the package name, the version from CHANGELOG.md, and describe the build
const __BUILD_INFO__ = new ReadonlyBuildInfo({
  name: pkg.name,
  version: changelogVersion(
    readFileSync(new URL("../../CHANGELOG.md", import.meta.url), "utf8"),
  ),
  exec: (cmd: string, args: string[]) => spawnSync(cmd, args).stdout.toString(),
  env: process.env,
});

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __BUILD_INFO__,
  },
  plugins: [dts()],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: fileURLToPath(import.meta.resolve("./src/index.ts")),
      name: "@mykomap/node-utils",
      formats: ["es"],
      fileName: "back-end",
    },
    rollupOptions: {
      // don't bundle dependencies or built-in Node.js modules
      external: [
        ...Object.keys(pkg.dependencies),
        ...Object.keys(pkg.devDependencies),
        /^node:.*/,
      ],
    },
    target: "esnext",
  },
  test: {
    globals: true,
    environment: "node",
    mockReset: true,
  },
});
