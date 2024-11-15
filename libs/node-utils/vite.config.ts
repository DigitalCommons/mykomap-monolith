import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import { fileURLToPath } from "node:url";

// Get the Vite env mode. This should typechecking, but seems not to be?
//const envMode = envMode: import.meta.env.MODE ?? '';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: fileURLToPath(import.meta.resolve("./src/index.ts")),
      name: "@mykomap/node-utils",
      formats: ["es"],
      fileName: "back-end",
    },
  },
  test: {
    globals: true,
    environment: "node",
    mockReset: true,
  },
});
