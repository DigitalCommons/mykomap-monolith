import { defineConfig, loadEnv } from "vite";
import { changelogVersion, ReadonlyBuildInfo } from "@mykomap/common";
import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import { spawnSync } from "node:child_process";

// Note, we don't get this from import.meta.dir, as that path can change when
// the original typescript is compiled into a javascript file and run from elsewhere.
const root = process.cwd();

/* Get the package name, set by npm from package.json, and the version
 * from CHANGELOG.md.
 *
 * The name could also be got by importing package.json, but that involves
 * some tsconfig.json gymnastics which I'd rather avoid:
 * https://github.com/vitejs/vite/discussions/17726
 */
const name = process.env.npm_package_name!;
const version = changelogVersion(
  readFileSync(new URL("../../CHANGELOG.md", import.meta.url), "utf8"),
);
const __BUILD_INFO__ = new ReadonlyBuildInfo({
  name,
  version,
  exec: (cmd: string, args: string[]) => spawnSync(cmd, args).stdout.toString(),
  env: process.env,
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    define: {
      __BUILD_INFO__,
    },
    plugins: [react()],
    build: {
      sourcemap: true,
    },

    base: env.VITE_BASE_URL,
    root,
  };
});
