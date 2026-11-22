import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { isCli } from "../../../scripts/is-cli.mjs";

const SCRIPTS = resolve(import.meta.dirname, "../../../scripts");
const dirs: string[] = [];
const temp = () => {
  const dir = mkdtempSync(join(tmpdir(), "is-cli-"));
  dirs.push(dir);
  return dir;
};
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

describe("isCli", () => {
  const script = join(SCRIPTS, "reference-vault.mjs");

  it("is true when the script was started by its own path", () => {
    expect(isCli(pathToFileURL(script).href, script)).toBe(true);
  });

  it("is true when the script was started through a symlink", () => {
    const link = join(temp(), "linked.mjs");
    symlinkSync(script, link);
    expect(isCli(pathToFileURL(script).href, link)).toBe(true);
  });

  it("is false for another file, for no argument and for a missing path", () => {
    expect(isCli(pathToFileURL(script).href, join(SCRIPTS, "verify.mjs"))).toBe(false);
    expect(isCli(pathToFileURL(script).href, undefined)).toBe(false);
    expect(isCli(pathToFileURL(script).href, join(temp(), "missing.mjs"))).toBe(false);
  });
});

describe("the scripts' command line", () => {
  it("runs when the script is started through a symlink", () => {
    const link = join(temp(), "linked.mjs");
    symlinkSync(join(SCRIPTS, "reference-vault.mjs"), link);
    const run = spawnSync(process.execPath, [link], { encoding: "utf8" });
    expect(run.stderr).toContain("usage: node scripts/reference-vault.mjs");
    expect(run.status).toBe(1);
  });

  it("is decided by the shared helper in every script, never by a path comparison", () => {
    const own = readdirSync(SCRIPTS).filter(
      (name) => name.endsWith(".mjs") && name !== "is-cli.mjs",
    );
    const comparing = own.filter((name) =>
      /process\.argv\[1\]/.test(readFileSync(join(SCRIPTS, name), "utf8")),
    );
    expect(comparing).toEqual([]);
  });
});
