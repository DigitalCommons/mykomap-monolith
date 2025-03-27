import { defineConfig } from "vitest/config";
import { ReadonlyBuildInfo } from "@mykomap/common";
import react from "@vitejs/plugin-react";
import { spawnSync } from "node:child_process";

// Note, we don't get this from import.meta.dir, as that path can change when
// the original typescript is compiled into a javascript file and run from elsewhere.
const root = process.cwd();

/* Get the package name.
 *
 * This could also be done by importing package.json, but that involves
 * some tsconfig.json gymnastics which I'd rather avoid:
 * https://github.com/vitejs/vite/discussions/17726
 */
const name = process.env.npm_package_name!;
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
  plugins: [react()],
  build: {
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests",
    env: {
      VITE_API_URL: "/api",
    },
  },
  base: "./",
  root,
});
