// @ts-check
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { dirname as posixDirname, join as posixJoin } from "node:path/posix";

/**
 * The packages whose code, styles or data end up in `main.js` and `styles.css`. A build plugin
 * records them (so the list is what the bundler actually included, not the dependency tree), and
 * `scripts/third-party-notices.mjs` turns the list into `THIRD-PARTY-NOTICES.txt`. Three things
 * carry third-party content into the output:
 *
 * - `js`: a module below `node_modules/`, as the bundler's module list shows it;
 * - `icons`: icon data. Nuxt UI generates the virtual module `virtual:nuxt-ui-icons` from the
 *   `@iconify-json/<prefix>` packages, so no module id points at them;
 * - `css`: `@import` and `@plugin` of a package in a style sheet the bundle holds, which Tailwind
 *   inlines into `styles.css`. The imports are read from the style sheets' sources.
 */

/** The virtual module Nuxt UI generates its bundled icon collections into. */
export const ICONS_MODULE = "virtual:nuxt-ui-icons";

/**
 * @param {string} path a module id; may carry a query and Windows separators
 * @returns {string | null} the package whose files the path points into
 */
export const packageNameOfPath = (path) => {
  const normalized = path.split("?")[0]?.replaceAll("\\", "/") ?? "";
  // Greedy prefix: the last `node_modules/`; a folder like `.nuxt-ui` is not a package.
  const match = /^(?:.*\/)?node_modules\/(@[^/]+\/[^/]+|[^/@.][^/]*)\/[^/]/.exec(normalized);
  return match?.[1] ?? null;
};

/**
 * @param {string} specifier an import specifier from a style sheet
 * @returns {string | null} the package name of a bare specifier, otherwise null
 */
export const packageNameOfSpecifier = (specifier) => {
  if (!/^(@[\w.-]+\/)?[\w~][\w.~-]*(\/|$)/.test(specifier)) return null;
  const parts = specifier.split("/");
  return specifier.startsWith("@") ? `${parts[0]}/${parts[1]}` : (parts[0] ?? null);
};

const CSS_IMPORT = /@(?:import|plugin)\s+(?:url\(\s*)?(["'])(.+?)\1/g;

/**
 * Packages a style sheet pulls in by `@import` or `@plugin`, following its relative imports.
 * @param {string} file
 * @param {(file: string) => string | undefined} read source of a file, undefined when unreadable
 * @returns {string[]} sorted package names
 */
export const cssImportPackages = (file, read) => {
  /** @type {Set<string>} */
  const packages = new Set();
  /** @type {Set<string>} */
  const seen = new Set();
  /** @param {string} current */
  const visit = (current) => {
    if (seen.has(current)) return;
    seen.add(current);
    const source = read(current)?.replace(/\/\*[\s\S]*?\*\//g, "");
    if (source === undefined) return;
    for (const match of source.matchAll(CSS_IMPORT)) {
      const specifier = match[2] ?? "";
      const name = packageNameOfSpecifier(specifier);
      if (name !== null) packages.add(name);
      else if (specifier.startsWith(".")) visit(posixJoin(posixDirname(current), specifier));
    }
  };
  visit(file);
  return [...packages].toSorted();
};

/**
 * @param {string} code the text of `virtual:nuxt-ui-icons`
 * @returns {string[]} the `@iconify-json/*` package of every bundled collection
 */
export const iconPackagesOf = (code) => {
  if (!code.includes("JSON.parse(")) {
    if (/addIcon|prefix/.test(code)) {
      throw new Error(`${ICONS_MODULE} has a format this script does not know; update it`);
    }
    return [];
  }
  const literal = /JSON\.parse\(("(?:[^"\\]|\\.)*")\)/.exec(code)?.[1];
  /** @type {unknown} */
  const collections = literal === undefined ? undefined : JSON.parse(JSON.parse(literal));
  if (!Array.isArray(collections)) {
    throw new Error(`${ICONS_MODULE} has a format this script does not know; update it`);
  }
  return collections.map((collection) => `@iconify-json/${collection.prefix}`).toSorted();
};

/**
 * @param {{ moduleIds: string[]; iconsCode?: string; readCss: (file: string) => string | undefined }} input
 * @returns {Record<string, string[]>} package name to the reasons it is bundled, sorted by name
 */
export const collectPackages = ({ moduleIds, iconsCode, readCss }) => {
  /** @type {Map<string, Set<string>>} */
  const reasons = new Map();
  /**
   * @param {string} name
   * @param {string} reason
   */
  const add = (name, reason) => {
    reasons.set(name, (reasons.get(name) ?? new Set()).add(reason));
  };
  for (const id of moduleIds) {
    const name = packageNameOfPath(id);
    if (name !== null) add(name, "js");
    const file = id.split("?")[0] ?? id;
    if (file.endsWith(".css") && name === null) {
      for (const imported of cssImportPackages(file, readCss)) add(imported, "css");
    }
  }
  for (const name of iconsCode === undefined ? [] : iconPackagesOf(iconsCode)) add(name, "icons");
  return Object.fromEntries(
    [...reasons]
      .toSorted(([a], [b]) => (a < b ? -1 : 1))
      .map(([name, set]) => [name, [...set].toSorted()]),
  );
};

/** @param {string} file */
const readIfPossible = (file) => {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return undefined;
  }
};

/**
 * Build plugin: after `main.js` is written, records the bundled packages and the sha256 of that
 * `main.js` in `outFile`, so a later step can tell whether the list belongs to the `dist/` it sees.
 * @param {{ outFile: string; enabled?: boolean }} options `enabled: false` for development builds
 * @returns {import("vite").Plugin}
 */
export const bundledPackages = ({ outFile, enabled = true }) => {
  /** @type {string | undefined} */
  let iconsCode;
  return {
    name: "weg-manager:bundled-packages",
    enforce: "post",
    transform(code, id) {
      if (id.split("?")[0] === ICONS_MODULE) iconsCode = code;
      return null;
    },
    writeBundle(options, bundle) {
      if (!enabled) return;
      const dir = options.dir ?? ".";
      const chunks = Object.values(bundle).filter((output) => output.type === "chunk");
      const main = chunks.find((chunk) => chunk.fileName === "main.js");
      if (main === undefined) throw new Error("bundled-packages: the build has no main.js chunk");
      const packages = collectPackages({
        moduleIds: chunks.flatMap((chunk) => chunk.moduleIds),
        ...(iconsCode === undefined ? {} : { iconsCode }),
        readCss: readIfPossible,
      });
      const mainJsSha256 = createHash("sha256")
        .update(readFileSync(join(dir, main.fileName)))
        .digest("hex");
      mkdirSync(dirname(outFile), { recursive: true });
      writeFileSync(outFile, `${JSON.stringify({ mainJsSha256, packages }, null, 2)}\n`);
    },
  };
};
