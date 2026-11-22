import { readFileSync } from "node:fs";
import { builtinModules } from "node:module";
import { fileURLToPath } from "node:url";
import { defineConfig, mergeConfig, type Plugin } from "vite";
import { bundledPackages } from "../scripts/bundled-packages.mjs";
import { PACKAGES_FILE } from "../scripts/third-party-notices.mjs";
import { sharedConfig } from "./vite.shared.ts";

/** Paths below resolve from the repository root, not from this folder. */
const ROOT = fileURLToPath(new URL("..", import.meta.url));

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
      source: readFileSync(`${ROOT}manifest.json`, "utf8"),
    });
  },
});

export default defineConfig(({ mode }) =>
  mergeConfig(sharedConfig({ mode }), {
    root: ROOT,
    // Records which packages the production bundle holds, for THIRD-PARTY-NOTICES.txt.
    plugins: [
      copyManifest(),
      bundledPackages({ outFile: `${ROOT}${PACKAGES_FILE}`, enabled: mode !== "development" }),
    ],
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
