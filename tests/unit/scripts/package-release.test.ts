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

const dist = (files = ["main.js", "manifest.json", "styles.css"]) => {
  const dir = temp();
  for (const file of files) {
    writeFileSync(
      join(dir, file),
      file === "manifest.json" ? JSON.stringify({ id: "weg-manager", version: "0.2.0" }) : file,
    );
  }
  return dir;
};

afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("packageRelease", () => {
  it("stages exactly the three plugin files under the plugin id", () => {
    const outDir = temp();
    const distDir = dist();
    writeFileSync(join(distDir, "extra.map"), "");
    const result = packageRelease({ distDir, outDir, tag: "0.2.0" });
    expect(result).toEqual({ folder: join(outDir, "weg-manager"), version: "0.2.0" });
    expect(readdirSync(result.folder).toSorted()).toEqual([
      "main.js",
      "manifest.json",
      "styles.css",
    ]);
  });

  it("works without a tag", () => {
    expect(packageRelease({ distDir: dist(), outDir: temp() }).version).toBe("0.2.0");
  });

  it("rejects a tag that differs from the manifest version", () => {
    expect(() => packageRelease({ distDir: dist(), outDir: temp(), tag: "0.3.0" })).toThrow(
      "tag 0.3.0 does not match manifest version 0.2.0",
    );
  });

  it("rejects a v-prefixed tag", () => {
    expect(() => packageRelease({ distDir: dist(), outDir: temp(), tag: "v0.2.0" })).toThrow(
      'must not start with "v"',
    );
  });

  it("names a missing file and stages nothing", () => {
    const outDir = temp();
    expect(() => packageRelease({ distDir: dist(["main.js", "manifest.json"]), outDir })).toThrow(
      "missing in",
    );
    expect(existsSync(join(outDir, "weg-manager"))).toBe(false);
  });
});
