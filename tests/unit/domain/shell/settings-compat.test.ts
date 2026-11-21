import { describe, expect, it } from "vitest";
import { decodeSettings, encodeSettings } from "../../../../src/domain/shell/settings";

/**
 * `data.json` files as earlier plugin versions wrote them. Loading them must give exactly these
 * results, before and after the schema-driven decode: same values, same issues, same writability.
 */
const OLD_FILES = [
  {
    name: "an empty file",
    file: {},
    greeting: null,
    logLevel: "warn",
    issues: [],
    writable: true,
  },
  {
    name: "a customised greeting",
    file: { schemaVersion: 1, greeting: "Moin zusammen", logLevel: "info" },
    greeting: "Moin zusammen",
    logLevel: "info",
    issues: [],
    writable: true,
  },
  {
    name: "the legacy default greeting",
    file: { schemaVersion: 1, greeting: "Hello from WEG Manager", logLevel: "warn" },
    greeting: null,
    logLevel: "warn",
    issues: [],
    writable: true,
  },
  {
    name: "the retired showRibbonIcon key",
    file: { schemaVersion: 1, greeting: "Hallo", showRibbonIcon: false, logLevel: "debug" },
    greeting: "Hallo",
    logLevel: "debug",
    issues: [],
    writable: true,
  },
  {
    name: "a newer schema version",
    file: { schemaVersion: 2, greeting: "Hallo", logLevel: "debug" },
    greeting: null,
    logLevel: "warn",
    issues: [{ code: "schema.newer", version: 2 }],
    writable: false,
  },
  {
    name: "an invalid greeting next to a valid log level",
    file: { schemaVersion: 1, greeting: "", logLevel: "error" },
    greeting: null,
    logLevel: "error",
    issues: [{ code: "greeting.length", max: 200 }],
    writable: true,
  },
] as const;

describe("old data.json files", () => {
  it.each(OLD_FILES)("load unchanged: $name", ({ file, greeting, logLevel, issues, writable }) => {
    const result = decodeSettings(file);
    expect(result.settings.schemaVersion).toBe(1);
    expect(result.settings.greeting).toBe(greeting);
    expect(result.settings.logLevel).toBe(logLevel);
    expect(result.issues).toEqual(issues);
    expect(result.writable).toBe(writable);
  });

  it("are saved with the same keys as before and no new key", () => {
    const decoded = decodeSettings({ schemaVersion: 1, greeting: "Moin", logLevel: "info" });
    expect(encodeSettings(decoded.settings)).toEqual({
      schemaVersion: 1,
      greeting: "Moin",
      logLevel: "info",
    });
    const legacy = decodeSettings({ schemaVersion: 1, greeting: "Hello from WEG Manager" });
    expect(encodeSettings(legacy.settings)).toEqual({ schemaVersion: 1, logLevel: "warn" });
  });
});
