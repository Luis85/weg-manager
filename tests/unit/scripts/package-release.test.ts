import { existsSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { packageRelease } from "../../../scripts/package-release.mjs";

const dirs: string[] = [];
const temp = () => {
  const dir = mkdtempSync(join(tmpdir(), "release-"));
  dirs.push(dir);
  return dir;
};

const MANIFEST = { id: "weg-manager", version: "0.2.0", minAppVersion: "1.15.1" };
const VALID_JS =
  '"use strict";const o=require("obsidian");class P extends o.Plugin{}module.exports=P;';
const VALID_CSS = ".weg-manager-root{--wm-a:1}.weg-manager-root .x{animation:wm-spin 1s}";

const CONTENT: Record<string, string> = {
  "main.js": VALID_JS,
  "manifest.json": JSON.stringify(MANIFEST),
  "styles.css": VALID_CSS,
};

/** A build output with the given files; `overrides` replaces a file's text. */
const dist = (files = Object.keys(CONTENT), overrides: Record<string, string> = {}) => {
  const dir = temp();
  for (const file of files) writeFileSync(join(dir, file), overrides[file] ?? CONTENT[file] ?? "");
  return dir;
};

/** The repository root's `manifest.json` and `versions.json`. */
const root = (manifest: object = MANIFEST, versions: object = { "0.2.0": "1.15.1" }) => {
  const dir = temp();
  writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest));
  writeFileSync(join(dir, "versions.json"), JSON.stringify(versions));
  return dir;
};

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("packageRelease", () => {
  it("stages exactly the three plugin files under the plugin id", () => {
    const outDir = temp();
    const result = packageRelease({ distDir: dist(), outDir, rootDir: root(), tag: "0.2.0" });
    expect(result).toEqual({ folder: join(outDir, "weg-manager"), version: "0.2.0" });
    expect(readdirSync(result.folder).toSorted()).toEqual([
      "main.js",
      "manifest.json",
      "styles.css",
    ]);
  });

  it("works without a tag", () => {
    const options = { distDir: dist(), outDir: temp(), rootDir: root() };
    expect(packageRelease(options).version).toBe("0.2.0");
  });

  it("rejects a tag that differs from the manifest version", () => {
    const options = { distDir: dist(), outDir: temp(), rootDir: root(), tag: "0.3.0" };
    expect(() => packageRelease(options)).toThrow(
      "tag 0.3.0 does not match manifest version 0.2.0",
    );
  });

  it("rejects a v-prefixed tag", () => {
    const options = { distDir: dist(), outDir: temp(), rootDir: root(), tag: "v0.2.0" };
    expect(() => packageRelease(options)).toThrow('must not start with "v"');
  });

  it("names a missing file and stages nothing", () => {
    const outDir = temp();
    const distDir = dist(["main.js", "manifest.json"]);
    expect(() => packageRelease({ distDir, outDir, rootDir: root() })).toThrow("missing in");
    expect(existsSync(join(outDir, "weg-manager"))).toBe(false);
  });

  describe("re-runs check:dist", () => {
    it("rejects a dist/ that is not a production build, and stages nothing", () => {
      const outDir = temp();
      const distDir = dist(undefined, { "main.js": "console.log(1)" });
      expect(() => packageRelease({ distDir, outDir, rootDir: root() })).toThrow(
        /check:dist.*main\.js: no default export/,
      );
      expect(existsSync(join(outDir, "weg-manager"))).toBe(false);
    });

    it("rejects a dist/ with a file Obsidian does not load", () => {
      const distDir = dist();
      writeFileSync(join(distDir, "main.js.map"), "");
      expect(() => packageRelease({ distDir, outDir: temp(), rootDir: root() })).toThrow(
        /check:dist.*unexpected file main\.js\.map/,
      );
    });

    it("rejects a dist/ manifest that differs from the root manifest.json", () => {
      const rootDir = root({ ...MANIFEST, description: "changed after the build" });
      expect(() => packageRelease({ distDir: dist(), outDir: temp(), rootDir })).toThrow(
        /check:dist.*manifest\.json differs/,
      );
    });
  });

  describe("versions.json", () => {
    it("rejects a manifest version it has no key for, and stages nothing", () => {
      const outDir = temp();
      const rootDir = root(MANIFEST, { "0.1.0": "1.15.1" });
      expect(() => packageRelease({ distDir: dist(), outDir, rootDir })).toThrow(
        'versions.json has no entry for 0.2.0 (run "npm version" so the bump adds it)',
      );
      expect(existsSync(join(outDir, "weg-manager"))).toBe(false);
    });

    it("rejects an entry that is not the manifest's minAppVersion", () => {
      const rootDir = root(MANIFEST, { "0.2.0": "1.0.0" });
      expect(() => packageRelease({ distDir: dist(), outDir: temp(), rootDir })).toThrow(
        'versions.json maps 0.2.0 to "1.0.0", but manifest.json has minAppVersion "1.15.1"',
      );
    });
  });
});
