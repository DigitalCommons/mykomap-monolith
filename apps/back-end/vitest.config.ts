import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ReadonlyBuildInfo } from "@mykomap/common";
import { spawnSync } from "node:child_process";

const path = fileURLToPath(import.meta.url);
const root = dirname(path);

/* Get the package name.
 *
 * This could also be done by importing package.json, but that involves
 * some tsconfig.json gymnastics which I'd rather avoid:
 * https://github.com/vitejs/vite/discussions/17726
 */
const name = process.env.npm_package_name || "@mykomap/back-end";
const __BUILD_INFO__ = new ReadonlyBuildInfo({
  name,
  exec: (cmd: string, args: string[]) => spawnSync(cmd, args).stdout.toString(),
});

// Write the version and sentry release into package.json
__BUILD_INFO__.updatePackageJson();

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
      name,
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
    env: {
      npm_package_name: "@mykomap/back-end",
      LC_ALL: "en_GB",
      TZ: "UTC",
    },
  },
  base: "./",
  root,
});
