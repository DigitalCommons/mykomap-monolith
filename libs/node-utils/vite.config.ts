import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";
import { ReadonlyBuildInfo } from "@mykomap/common";
import { spawnSync } from "node:child_process";
import pkg from "./package.json" with { type: "json" };

// Get the Vite env mode. This should typechecking, but seems not to be?
//const envMode = envMode: import.meta.env.MODE ?? '';

// Get the package name and build info
const name = pkg.name;
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
