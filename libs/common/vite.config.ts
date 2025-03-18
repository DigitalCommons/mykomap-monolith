import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { ReadonlyBuildInfo } from "./src/index.js";
import { spawnSync } from "node:child_process";
import pkg from "./package.json" with { type: "json" };

// Get the package name and build info
const __BUILD_INFO__ = new ReadonlyBuildInfo({
  name: pkg.name,
  exec: (cmd, args) => spawnSync(cmd, args).stdout.toString(),
});

// Write the version and sentry release into package.json
__BUILD_INFO__.updatePackageJson();

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
      external: [...Object.keys(pkg.dependencies), /^node:.*/],
    },
    target: "esnext",
  },
  plugins: [
    dts({ include: ["**/*.ts", "**/*.js", "**/mykomap-openapi.json"] }),
  ], // emit TS declaration files
});
