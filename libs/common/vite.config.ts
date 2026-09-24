import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { changelogVersion, ReadonlyBuildInfo } from "./src/index.js";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import pkg from "./package.json" with { type: "json" };

// Get the package name, the version from CHANGELOG.md, and describe the build
const __BUILD_INFO__ = new ReadonlyBuildInfo({
  name: pkg.name,
  version: changelogVersion(
    readFileSync(new URL("../../CHANGELOG.md", import.meta.url), "utf8"),
  ),
  exec: (cmd, args) => spawnSync(cmd, args).stdout.toString(),
  env: process.env,
});

export default defineConfig({
  define: {
    __BUILD_INFO__,
  },
  build: {
    lib: {
      entry: "./src/index.ts",
      formats: ["es"],
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
  plugins: [
    dts({
      include: ["**/*.ts", "**/*.js", "**/mykomap-openapi.json"],
      exclude: "test/**",
    }),
  ], // emit TS declaration files
});
