import { describe, expect, it } from "vitest";
import { bumpVersion } from "../../../scripts/version-bump.mjs";

const manifest = { id: "weg-manager", version: "0.1.0", minAppVersion: "1.15.1" };

describe("bumpVersion", () => {
  it("sets the manifest version and records the minimum app version", () => {
    const next = bumpVersion("0.2.0", manifest, { "0.1.0": "1.15.1" });
    expect(next.manifest).toEqual({ ...manifest, version: "0.2.0" });
    expect(next.versions).toEqual({ "0.1.0": "1.15.1", "0.2.0": "1.15.1" });
  });

  it("compares numerically, not as text", () => {
    expect(bumpVersion("0.10.0", { ...manifest, version: "0.9.0" }, {}).manifest.version).toBe(
      "0.10.0",
    );
    expect(bumpVersion("1.0.0", { ...manifest, version: "0.99.99" }, {}).manifest.version).toBe(
      "1.0.0",
    );
  });

  it.each(["v0.2.0", "0.2", "0.2.0-beta.1", ""])("rejects the non-plain version %j", (version) => {
    expect(() => bumpVersion(version, manifest, {})).toThrow("not a plain x.y.z version");
  });

  it.each(["0.1.0", "0.0.9"])("rejects %s, which is not greater than 0.1.0", (version) => {
    expect(() => bumpVersion(version, manifest, {})).toThrow(
      "is not greater than the current 0.1.0",
    );
  });
});
