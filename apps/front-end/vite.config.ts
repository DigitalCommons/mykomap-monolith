import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Note, we don't get this from import.meta.dir, as that path can change when
// the original typescript is compiled into a javascript file and run from elsewhere.
const root = process.cwd();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    open: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests",
  },
  base: "./",
  root,
});
