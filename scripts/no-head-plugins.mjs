// @ts-check
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Nuxt UI's runtime `colors` plugin writes a `<style>` into `document.head`, and its `head` plugin
 * only exists to serve it. The plugin owns no part of the host page, so both become no-ops and
 * the colour roles live in `src/styles/bridge.css`. Each replaced file is pinned by sha256: a
 * Nuxt UI upgrade that changes one fails the build until the replacement is reviewed again.
 */
export const REPLACED = {
  "runtime/plugins/colors.js": "edb28f0f585d9bd023c36e8297c97f3094a136ddaa5f3ab3d86ed7034422d18d",
  "runtime/vue/plugins/head.js": "01934e8a3dfd7b743ed8f8ec43bf4fd3a80bc16e52662f3e9914f395c263b956",
};

/** One module per replaced file: Vue warns when the same plugin object is installed twice. */
const NOOP_PREFIX = "\0weg-manager:nuxt-ui-noop:";

/** @param {string} file */
export const sha256 = (file) => createHash("sha256").update(readFileSync(file)).digest("hex");

/** Directory of `@nuxt/ui/dist`, resolved like the build resolves it. */
export const nuxtUiDist = () => {
  // `@nuxt/ui/vite` resolves to `dist/vite.mjs`; the package does not export package.json.
  return dirname(fileURLToPath(import.meta.resolve("@nuxt/ui/vite")));
};

/**
 * @param {{ dist?: string; pins?: Record<string, string> }} [options]
 * @returns {string[]} problems; empty when every pinned file matches.
 */
export const checkPins = ({ dist = nuxtUiDist(), pins = REPLACED } = {}) =>
  Object.entries(pins).flatMap(([file, expected]) => {
    let actual;
    try {
      actual = sha256(join(dist, file));
    } catch {
      return [`${file} is missing from @nuxt/ui`];
    }
    return actual === expected
      ? []
      : [`${file} changed in @nuxt/ui (sha256 ${actual}); review it and update REPLACED`];
  });

/** @returns {import("vite").Plugin} */
export const noHeadPlugins = () => {
  const dist = nuxtUiDist();
  const replaced = Object.keys(REPLACED).map((file) => join(dist, file));
  return {
    name: "weg-manager:no-head-plugins",
    enforce: "pre",
    buildStart() {
      const problems = checkPins({ dist });
      if (problems.length > 0) this.error(problems.join("\n"));
    },
    resolveId(id) {
      const index = replaced.indexOf(id.split("?")[0] ?? id);
      return index === -1 ? null : `${NOOP_PREFIX}${index}`;
    },
    load(id) {
      return id.startsWith(NOOP_PREFIX) ? "export default { install() {} };" : null;
    },
  };
};
