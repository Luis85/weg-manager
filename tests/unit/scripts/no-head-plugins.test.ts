import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { REPLACED, checkPins, noHeadPlugins, sha256 } from "../../../scripts/no-head-plugins.mjs";

const fixture = (files: Record<string, string>) => {
  const dir = mkdtempSync(join(tmpdir(), "nuxt-ui-"));
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(join(dir, file, ".."), { recursive: true });
    writeFileSync(join(dir, file), content);
  }
  return dir;
};

describe("checkPins", () => {
  it("passes against the installed @nuxt/ui", () => {
    expect(checkPins()).toEqual([]);
  });

  it("passes when every pinned file matches", () => {
    const dist = fixture({ "a.js": "one" });
    expect(checkPins({ dist, pins: { "a.js": sha256(join(dist, "a.js")) } })).toEqual([]);
  });

  it("reports a changed file", () => {
    const dist = fixture({ "a.js": "changed" });
    expect(checkPins({ dist, pins: { "a.js": "0".repeat(64) } })).toEqual([
      expect.stringContaining("a.js changed in @nuxt/ui"),
    ]);
  });

  it("reports a missing file", () => {
    const dist = fixture({});
    expect(checkPins({ dist, pins: { "gone.js": "0".repeat(64) } })).toEqual([
      "gone.js is missing from @nuxt/ui",
    ]);
  });
});

describe("noHeadPlugins", () => {
  it("replaces each pinned plugin with its own no-op module", () => {
    const plugin = noHeadPlugins();
    const resolve = plugin.resolveId as (id: string) => string | null;
    const load = plugin.load as (id: string) => string | null;
    const files = Object.keys(REPLACED);
    const dist = join(import.meta.dirname, "../../../node_modules/@nuxt/ui/dist");
    const ids = files.map((file) => resolve(join(dist, file)));
    expect(new Set(ids).size).toBe(files.length);
    for (const id of ids) expect(load(id ?? "")).toContain("install()");
    expect(resolve("vue")).toBeNull();
    expect(load("vue")).toBeNull();
  });
});
