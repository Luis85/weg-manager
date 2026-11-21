import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

/** Paths below resolve from the repository root, not from this folder. */
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PROBE = "tests/e2e/probe-plugin";

const copyManifest = (): Plugin => ({
  name: "weg-manager:copy-probe-manifest",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "manifest.json",
      source: readFileSync(`${ROOT}${PROBE}/manifest.json`, "utf8"),
    });
  },
});

/**
 * The e2e probe plugin: the real `NoteStore` adapter from `src/`, bundled with Effect into one
 * CommonJS `main.js` next to its manifest, so `wdio.conf.mts` can install it beside `dist/`. It is
 * never part of the plugin build.
 */
export default defineConfig({
  root: ROOT,
  plugins: [copyManifest()],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: `${PROBE}/dist`,
    emptyOutDir: true,
    target: "es2022",
    minify: false,
    lib: { entry: `${PROBE}/main.ts`, formats: ["cjs"], fileName: () => "main.js" },
    rolldownOptions: {
      external: (id) => id === "obsidian",
      output: { exports: "default", codeSplitting: false },
    },
  },
});
