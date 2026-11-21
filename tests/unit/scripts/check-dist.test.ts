import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { BUDGETS, checkDist } from "../../../scripts/check-dist.mjs";

const OPTIONS = { id: "weg-manager", prefix: "wm" };
const MANIFEST = { id: "weg-manager", name: "WEG Manager", version: "0.1.0" };
const VALID_JS =
  '"use strict";const o=require("obsidian");class P extends o.Plugin{}module.exports=P;';
const VALID_CSS =
  ".weg-manager-root{--wm-a:1}.weg-manager-root .x{animation:wm-spin 1s}@keyframes wm-spin{to{opacity:1}}@property --wm-tw-x{syntax:'*';inherits:false}";

let dirs: string[] = [];

const fixture = (files: Record<string, string> = {}) => {
  const dir = mkdtempSync(join(tmpdir(), "check-dist-"));
  dirs.push(dir);
  const all: Record<string, string> = {
    "main.js": VALID_JS,
    "styles.css": VALID_CSS,
    "manifest.json": JSON.stringify(MANIFEST),
    ...files,
  };
  for (const [name, content] of Object.entries(all)) {
    if (content !== "") writeFileSync(join(dir, name), content);
  }
  return dir;
};

const violations = (files: Record<string, string> = {}) =>
  checkDist(fixture(files), MANIFEST, OPTIONS);

afterEach(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true });
  dirs = [];
});

describe("checkDist", () => {
  it("passes a valid build", () => {
    expect(violations()).toEqual([]);
  });

  it("reports a missing file", () => {
    expect(violations({ "styles.css": "" }).join()).toMatch(/missing.*styles\.css/);
  });

  it("reports an extra file", () => {
    expect(violations({ "chunk.js": "x" }).join()).toMatch(/unexpected.*chunk\.js/);
  });

  it("reports a manifest that differs from the root manifest", () => {
    const changed = JSON.stringify({ ...MANIFEST, version: "9.9.9" });
    expect(violations({ "manifest.json": changed }).join()).toMatch(/manifest/);
  });

  it("reports main.js without a default CommonJS export", () => {
    expect(violations({ "main.js": "exports.x=1;" }).join()).toMatch(/default export/);
  });

  it.each(["vue", "effect", "@nuxt/ui", "@tanstack/vue-form"])(
    "reports a require of the bundled dependency %s",
    (name) => {
      const js = `${VALID_JS}require("${name}");`;
      expect(violations({ "main.js": js }).join()).toContain(`require("${name}")`);
    },
  );

  it("allows the host externals", () => {
    const js = `${VALID_JS}require("electron");require("@codemirror/view");require("@lezer/common");require("node:path");require("fs");`;
    expect(violations({ "main.js": js })).toEqual([]);
  });

  it.each([
    'fetch("https://example.com/x")',
    "fetch('http://example.com')",
    'x.open("GET","https://example.com")',
  ])("reports a network target in %s", (call) => {
    expect(violations({ "main.js": `${VALID_JS}${call};` }).join()).toMatch(/network/);
  });

  it("reports an unscoped selector", () => {
    expect(violations({ "styles.css": `${VALID_CSS}.loose{color:red}` }).join()).toMatch(
      /unscoped.*\.loose/,
    );
  });

  it("reports a surviving @layer", () => {
    expect(violations({ "styles.css": `${VALID_CSS}@layer base{}` }).join()).toMatch(/@layer/);
  });

  it("reports unprefixed @keyframes and @property", () => {
    const css = `${VALID_CSS}@keyframes spin{to{opacity:1}}@property --tw-y{syntax:'*';inherits:false}`;
    const found = violations({ "styles.css": css }).join();
    expect(found).toMatch(/@keyframes spin/);
    expect(found).toMatch(/@property --tw-y/);
  });

  it("reports bundles over budget", () => {
    const bigJs = `${VALID_JS}/*${"x".repeat(BUDGETS["main.js"])}*/`;
    const bigCss = `${VALID_CSS}/*${"x".repeat(BUDGETS["styles.css"])}*/`;
    const found = violations({ "main.js": bigJs, "styles.css": bigCss }).join();
    expect(found).toMatch(/main\.js.*budget/);
    expect(found).toMatch(/styles\.css.*budget/);
  });

  it("keeps the budgets at 1.5 MB and 250 KB", () => {
    expect(BUDGETS).toEqual({ "main.js": 1.5 * 1024 * 1024, "styles.css": 250 * 1024 });
  });
});
