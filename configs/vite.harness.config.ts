import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig } from "vite";
import { sharedConfig } from "./vite.shared.ts";

/** Browser harness: the real presentation and application code with harness adapters. */
export default defineConfig(({ mode }) =>
  mergeConfig(sharedConfig({ mode, skipScope: (file) => file.endsWith("fake-host.css") }), {
    root: fileURLToPath(new URL("../harness", import.meta.url)),
    base: "./",
    build: {
      outDir: "../reports/harness",
      emptyOutDir: true,
      target: "es2022",
      chunkSizeWarningLimit: 2000,
    },
  }),
);
