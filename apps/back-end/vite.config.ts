import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const path = fileURLToPath(import.meta.url);
const root = dirname(path);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [dts()],
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
