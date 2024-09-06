import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
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
  plugins: [dts({ include: ["**/*.ts", "**/*.js"] })], // emit TS declaration files
});
