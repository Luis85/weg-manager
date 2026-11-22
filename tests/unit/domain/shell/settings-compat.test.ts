import { describe, expect, it } from "vitest";
import { decodeSettings, encodeSettings } from "../../../../src/domain/shell/settings";

/**
 * `data.json` files as earlier plugin versions wrote them. Loading them must give exactly these
 * results: same values, same issues, same writability. The demo greeting of versions before the
 * tracer slice is an unknown key now: it is dropped without an issue.
 */
const OLD_FILES = [
  {
    name: "an empty file",
    file: {},
    logLevel: "warn",
    issues: [],
    writable: true,
  },
  {
    name: "a customised greeting",
    file: { schemaVersion: 1, greeting: "Moin zusammen", logLevel: "info" },
    logLevel: "info",
    issues: [],
    writable: true,
  },
  {
    name: "the legacy default greeting",
    file: { schemaVersion: 1, greeting: "Hello from WEG Manager", logLevel: "warn" },
    logLevel: "warn",
    issues: [],
    writable: true,
  },
  {
    name: "the retired showRibbonIcon key",
    file: { schemaVersion: 1, greeting: "Hallo", showRibbonIcon: false, logLevel: "debug" },
    logLevel: "debug",
    issues: [],
    writable: true,
  },
  {
    name: "a newer schema version",
    file: { schemaVersion: 2, greeting: "Hallo", logLevel: "debug" },
    logLevel: "warn",
    issues: [{ code: "schema.newer", version: 2 }],
    writable: false,
  },
  {
    name: "an invalid greeting next to a valid log level",
    file: { schemaVersion: 1, greeting: "", logLevel: "error" },
    logLevel: "error",
    issues: [],
    writable: true,
  },
] as const;

describe("old data.json files", () => {
  it.each(OLD_FILES)("load unchanged: $name", ({ file, logLevel, issues, writable }) => {
    const result = decodeSettings(file);
    expect(result.settings.schemaVersion).toBe(1);
    expect(result.settings.logLevel).toBe(logLevel);
    expect(Object.keys(result.settings)).not.toContain("greeting");
    expect(result.issues).toEqual(issues);
    expect(result.writable).toBe(writable);
  });

  it("are saved with the keys they had, without the greeting and without a new key", () => {
    const decoded = decodeSettings({ schemaVersion: 1, greeting: "Moin", logLevel: "info" });
    expect(encodeSettings(decoded.settings)).toEqual({ schemaVersion: 1, logLevel: "info" });
  });
});
