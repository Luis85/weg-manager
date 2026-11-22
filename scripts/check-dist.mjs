// @ts-check
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { builtinModules } from "node:module";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "postcss";

export const EXPECTED_FILES = ["main.js", "manifest.json", "styles.css"];

/** The prefix of every keyframe and custom property the plugin's CSS defines. */
export const CSS_PREFIX = "wm";

/** Size budgets in bytes; raising one needs an ADR. */
export const BUDGETS = { "main.js": 1.5 * 1024 * 1024, "styles.css": 250 * 1024 };

/**
 * Every failure the in-memory adapters (`src/infrastructure/memory/`) make up carries this text,
 * so a `main.js` that bundled one of them holds it.
 */
export const TEST_ONLY_MARKER = "weg-manager/test-only";

const HOST_EXTERNALS = [/^obsidian$/, /^electron$/, /^@codemirror\//, /^@lezer\//];
const BUILTINS = new Set(builtinModules);

/** @param {string} name */
const isAllowedRequire = (name) =>
  HOST_EXTERNALS.some((pattern) => pattern.test(name)) ||
  name.startsWith("node:") ||
  BUILTINS.has(name);

/**
 * @param {string} js
 * @returns {string[]}
 */
const checkJs = (js) => {
  /** @type {string[]} */
  const found = [];
  if (!/module\.exports\s*=/.test(js))
    found.push("main.js: no default export (module.exports = …)");
  for (const match of js.matchAll(/require\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
    const name = match[1] ?? "";
    if (!isAllowedRequire(name)) found.push(`main.js: require("${name}") must be bundled`);
  }
  if (js.includes(TEST_ONLY_MARKER))
    found.push("main.js: holds test-only code (the in-memory adapters)");
  if (/(fetch\(\s*|\.open\(\s*["'`][A-Z]+["'`]\s*,\s*)["'`]https?:/i.test(js)) {
    found.push("main.js: network target in a string literal (no runtime network access)");
  }
  return found;
};

/**
 * @param {string} css
 * @param {{ id: string; prefix: string }} options
 * @returns {string[]}
 */
const checkCss = (css, { id, prefix }) => {
  /** @type {string[]} */
  const found = [];
  const scope = `.${id}-root`;
  const root = parse(css);
  root.walkAtRules((atRule) => {
    if (atRule.name === "layer") found.push("styles.css: @layer must not survive");
    if (/keyframes$/i.test(atRule.name) && !atRule.params.trim().startsWith(`${prefix}-`)) {
      found.push(`styles.css: @keyframes ${atRule.params.trim()} needs the ${prefix}- prefix`);
    }
    if (atRule.name === "property" && !atRule.params.trim().startsWith(`--${prefix}-`)) {
      found.push(`styles.css: @property ${atRule.params.trim()} needs the --${prefix}- prefix`);
    }
  });
  root.walkRules((rule) => {
    const parent = rule.parent;
    if (
      parent?.type === "atrule" &&
      /keyframes$/i.test(/** @type {import("postcss").AtRule} */ (parent).name)
    ) {
      return;
    }
    for (const selector of rule.selectors) {
      if (!selector.trim().startsWith(scope))
        found.push(`styles.css: unscoped selector ${selector.trim()}`);
    }
  });
  return found;
};

/**
 * Build-output invariants: exactly three files, manifest equal to the root one, a CommonJS default
 * export, everything but host externals bundled, no network targets, no test-only code, scoped
 * CSS, size budgets.
 * @param {string} dir
 * @param {object} rootManifest
 * @param {{ id: string; prefix: string }} options
 * @returns {string[]} violations; empty means the build passes
 */
export const checkDist = (dir, rootManifest, options) => {
  if (!existsSync(dir)) return [`${dir}: missing build output`];
  const files = readdirSync(dir).filter((name) => !name.startsWith("."));
  const read = (/** @type {string} */ name) => readFileSync(join(dir, name), "utf8");
  /** @type {Record<string, (content: string) => string[]>} */
  const checks = {
    "manifest.json": (content) =>
      JSON.stringify(JSON.parse(content)) === JSON.stringify(rootManifest)
        ? []
        : ["manifest.json differs from the root manifest.json"],
    "main.js": checkJs,
    "styles.css": (content) => checkCss(content, options),
  };
  return [
    ...EXPECTED_FILES.filter((name) => !files.includes(name)).map((name) => `missing file ${name}`),
    ...files
      .filter((name) => !EXPECTED_FILES.includes(name))
      .map((name) => `unexpected file ${name}`),
    ...files.flatMap((name) => checks[name]?.(read(name)) ?? []),
    ...Object.entries(BUDGETS)
      .filter(([name, budget]) => files.includes(name) && statSync(join(dir, name)).size > budget)
      .map(([name, budget]) => `${name} is over its budget of ${budget} bytes`),
  ];
};

const isCli =
  process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) {
  const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
  const found = checkDist("dist", manifest, { id: manifest.id, prefix: CSS_PREFIX });
  for (const violation of found) console.error(`check:dist ✗ ${violation}`);
  if (found.length === 0) console.log("check:dist ✓ dist/ matches every invariant");
  process.exitCode = found.length === 0 ? 0 : 1;
}
