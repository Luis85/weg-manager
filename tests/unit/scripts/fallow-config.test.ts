import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FALLOW_JSON, STALE, fallowJson, syncFallowJson } from "../../../scripts/fallow-config.mjs";

type Rule = { readonly from: string; readonly allow: readonly string[] };
type Config = { readonly boundaries: { readonly rules: readonly Rule[] } };

const allowOf = (text: string, from: string) =>
  (JSON.parse(text) as Config).boundaries.rules.find((rule) => rule.from === from)?.allow;

/** A feature module `points` with a domain, an application and a presentation folder. */
const withPoints = {
  modules: ["shell", "notes", "communities", "points"],
  has: (folder: string, module: string) =>
    module === "points"
      ? ["domain", "application", "presentation"].includes(folder)
      : module !== "communities" || folder !== "infrastructure/obsidian",
};

describe("fallowJson", () => {
  it("is the file on disk for the repository's module list and folders", async () => {
    expect(await fallowJson()).toBe(readFileSync(FALLOW_JSON, "utf8"));
  });

  it("lets each layer import every module that has a folder in it", async () => {
    const text = await fallowJson(withPoints);
    expect(allowOf(text, "domain")).toEqual([
      "domain/shell",
      "domain/notes",
      "domain/communities",
      "domain/points",
    ]);
    expect(allowOf(text, "application")).toEqual([
      "domain",
      "application/shell",
      "application/notes",
      "application/communities",
      "application/points",
      "application-module",
      "application-composition",
    ]);
    expect(allowOf(text, "presentation")?.slice(0, 4)).toEqual([
      "presentation/shell",
      "presentation/notes",
      "presentation/communities",
      "presentation/points",
    ]);
    expect(allowOf(text, "adapters")?.slice(0, 3)).toEqual([
      "adapters/shell",
      "adapters/notes",
      "infrastructure",
    ]);
  });

  it("gives the same text for the same list and folders", async () => {
    expect(await fallowJson(withPoints)).toBe(await fallowJson(withPoints));
  });
});

/** A path in a fresh temporary folder. */
const file = () => join(mkdtempSync(join(tmpdir(), "fallow-config-")), "fallow.json");

describe("syncFallowJson", () => {
  it("writes the file, and then finds it current", async () => {
    const path = file();
    expect(await syncFallowJson({ check: false, path, expected: "{}\n" })).toBeUndefined();
    expect(readFileSync(path, "utf8")).toBe("{}\n");
    expect(await syncFallowJson({ check: true, path, expected: "{}\n" })).toBeUndefined();
  });

  it("names the command to run when the file is stale or missing, and leaves it as it is", async () => {
    const path = file();
    expect(await syncFallowJson({ check: true, path, expected: "{}\n" })).toBe(STALE);
    writeFileSync(path, "{ }\n");
    expect(await syncFallowJson({ check: true, path, expected: "{}\n" })).toBe(
      "configs/fallow.json does not match the module list: run `npm run fallow:config`.",
    );
    expect(readFileSync(path, "utf8")).toBe("{ }\n");
  });

  it("checks the repository's file against the module list by default", async () => {
    expect(await syncFallowJson({ check: true })).toBeUndefined();
  });
});
