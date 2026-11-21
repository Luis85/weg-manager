import { readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { defineConfig, mergeConfig, type Plugin } from "vite";
import { sharedConfig } from "./vite.shared.ts";

const HOST_EXTERNALS = [/^obsidian$/, /^electron$/, /^@codemirror\//, /^@lezer\//, /^node:/];
const BUILTINS = new Set(builtinModules);

const isExternal = (id: string): boolean =>
  BUILTINS.has(id) || HOST_EXTERNALS.some((pattern) => pattern.test(id));

/** Copies the root manifest next to the bundle so `dist/` is installable as-is. */
const copyManifest = (): Plugin => ({
  name: "weg-manager:copy-manifest",
  generateBundle() {
    this.emitFile({
      type: "asset",
      fileName: "manifest.json",
      source: readFileSync("manifest.json", "utf8"),
    });
  },
});

export default defineConfig(({ mode }) =>
  mergeConfig(sharedConfig({ mode }), {
    plugins: [copyManifest()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      target: "es2022",
      minify: mode !== "development",
      sourcemap: mode === "development" ? "inline" : false,
      cssCodeSplit: false,
      lib: {
        entry: "src/main.ts",
        formats: ["cjs"],
        fileName: () => "main.js",
        cssFileName: "styles",
      },
      rolldownOptions: {
        external: isExternal,
        output: { exports: "default", codeSplitting: false },
      },
    },
  }),
);
