import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { versionProblems } from "../../../scripts/check-versions.mjs";

const manifest = { id: "weg-manager", version: "0.3.0", minAppVersion: "1.15.1" };
const ok = { packageVersion: "0.3.0", manifest, versions: { "0.3.0": "1.15.1" } };

describe("versionProblems", () => {
  it("finds nothing when package.json, manifest.json and versions.json agree", () => {
    expect(versionProblems(ok)).toEqual([]);
    expect(versionProblems({ ...ok, tag: "0.3.0" })).toEqual([]);
  });

  it("names a package.json version that differs from manifest.json", () => {
    expect(versionProblems({ ...ok, packageVersion: "0.2.0" })).toEqual([
      "package.json has version 0.2.0, but manifest.json has 0.3.0",
    ]);
  });

  it("names a missing versions.json entry and one that maps to another minAppVersion", () => {
    expect(versionProblems({ ...ok, versions: {} })).toEqual([
      'versions.json has no entry for 0.3.0 (run "npm version" so the bump adds it)',
    ]);
    expect(versionProblems({ ...ok, versions: { "0.3.0": "1.0.0" } })).toEqual([
      'versions.json maps 0.3.0 to "1.0.0", but manifest.json has minAppVersion "1.15.1"',
    ]);
  });

  it("checks a tag against the manifest, and refuses a v prefix", () => {
    expect(versionProblems({ ...ok, tag: "0.4.0" })).toEqual([
      "tag 0.4.0 does not match manifest version 0.3.0",
    ]);
    expect(versionProblems({ ...ok, tag: "v0.3.0" })).toContain(
      'tag "v0.3.0" must not start with "v"',
    );
  });

  it("reports every problem at once", () => {
    expect(
      versionProblems({ ...ok, packageVersion: "0.1.0", versions: {}, tag: "0.4.0" }),
    ).toHaveLength(3);
  });
});

describe("the command line", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });
  const run = (args: string[], packageVersion: string) => {
    const dir = mkdtempSync(join(tmpdir(), "versions-"));
    dirs.push(dir);
    writeFileSync(join(dir, "package.json"), JSON.stringify({ version: packageVersion }));
    writeFileSync(join(dir, "manifest.json"), JSON.stringify(manifest));
    writeFileSync(join(dir, "versions.json"), JSON.stringify(ok.versions));
    const script = resolve(import.meta.dirname, "../../../scripts/check-versions.mjs");
    return spawnSync(process.execPath, [script, ...args], { cwd: dir, encoding: "utf8" });
  };

  it("exits 0 when everything agrees", () => {
    const result = run(["--tag", "0.3.0"], "0.3.0");
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("check:versions");
  });

  it("exits 1 and says what differs", () => {
    const result = run([], "0.2.0");
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("package.json has version 0.2.0");
  });
});
