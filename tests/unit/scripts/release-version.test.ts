import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { resolveReleaseTag, runResolve } from "../../../scripts/release-version.mjs";

const byHand = (inputVersion: string, ref = "refs/heads/main") => ({
  event: "workflow_dispatch",
  ref,
  refName: ref.replace("refs/heads/", ""),
  inputVersion,
});
const byTag = (refName: string) => ({
  event: "push",
  ref: `refs/tags/${refName}`,
  refName,
  inputVersion: "",
});

const env = (e: ReturnType<typeof byHand>, file: string) => ({
  EVENT: e.event,
  REF: e.ref,
  REF_NAME: e.refName,
  INPUT_VERSION: e.inputVersion,
  GITHUB_OUTPUT: file,
});

describe("resolveReleaseTag", () => {
  it("takes the input of a start by hand on main", () => {
    expect(resolveReleaseTag(byHand("0.3.0"))).toBe("0.3.0");
  });

  it("takes the tag name of a start by tag", () => {
    expect(resolveReleaseTag(byTag("1.2.10"))).toBe("1.2.10");
  });

  it("refuses a start by hand on another ref", () => {
    expect(() => resolveReleaseTag(byHand("0.3.0", "refs/heads/feature"))).toThrow(
      "Start the release on main, not on feature.",
    );
  });

  it.each(["v0.3.0", "0.3", "0.3.0-beta.1", "", "0.3.0\n", "0.3.0\n9.9.9", " 0.3.0"])(
    "refuses %j, which is not a bare x.y.z",
    (input) => {
      expect(() => resolveReleaseTag(byHand(input))).toThrow("bare x.y.z");
    },
  );
});

describe("runResolve", () => {
  const dirs: string[] = [];
  afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
  });
  const output = () => {
    const dir = mkdtempSync(join(tmpdir(), "resolve-"));
    dirs.push(dir);
    const file = join(dir, "output");
    writeFileSync(file, "");
    return file;
  };

  it("writes the tag to the step output", () => {
    const file = output();
    expect(runResolve(env(byHand("0.3.0"), file), () => false)).toBeUndefined();
    expect(readFileSync(file, "utf8")).toBe("tag=0.3.0\n");
  });

  it("refuses an existing tag in a start by hand, and writes nothing", () => {
    const file = output();
    expect(runResolve(env(byHand("0.3.0"), file), (tag) => tag === "0.3.0")).toContain(
      "Tag 0.3.0 already exists",
    );
    expect(readFileSync(file, "utf8")).toBe("");
  });

  it("accepts the existing tag of a start by tag", () => {
    const file = output();
    expect(runResolve(env(byTag("0.3.0"), file), () => true)).toBeUndefined();
    expect(readFileSync(file, "utf8")).toBe("tag=0.3.0\n");
  });

  it("returns the refusal of the version rules", () => {
    expect(runResolve(env(byHand("x"), output()), () => false)).toContain("bare x.y.z");
  });
});
