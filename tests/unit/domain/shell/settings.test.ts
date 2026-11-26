import { anything, assert, property } from "fast-check";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  LOG_LEVELS,
  SETTINGS_VERSION,
  WEEKDAYS,
  decodeSettings,
  encodeSettings,
  validatePatch,
  type Settings,
} from "../../../../src/domain/shell/settings";

const valid: Settings = {
  schemaVersion: 1,
  logLevel: "debug",
  rootFolder: "Beirat/WEG",
  weekStart: "monday",
  weekMinutes: 60,
  weekDecisions: 7,
  acuteDays: 2,
};

const ROOT_FOLDER_ISSUE = { code: "rootFolder.invalid", max: 100 };

describe("the week settings (PBI-13 criterion 5)", () => {
  it("default to Monday, 60 minutes, 7 decisions and 2 days, and stay out of the file", () => {
    expect([
      DEFAULT_SETTINGS.weekStart,
      DEFAULT_SETTINGS.weekMinutes,
      DEFAULT_SETTINGS.weekDecisions,
      DEFAULT_SETTINGS.acuteDays,
    ]).toEqual(["monday", 60, 7, 2]);
    expect(Object.keys(encodeSettings(DEFAULT_SETTINGS)).toSorted()).toEqual([
      "logLevel",
      "schemaVersion",
    ]);
    expect(WEEKDAYS).toEqual([
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ]);
  });

  it("reads changed values and writes them", () => {
    const changed = {
      ...valid,
      weekStart: "thursday",
      weekMinutes: 45,
      weekDecisions: 5,
      acuteDays: 0,
    } as const;
    expect(decodeSettings(changed)).toEqual({ settings: changed, issues: [], writable: true });
    expect(encodeSettings(changed)).toMatchObject({ weekStart: "thursday", weekMinutes: 45 });
  });

  it.each([
    ["weekStart", "montag", { code: "weekStart.unknown", allowed: WEEKDAYS }],
    ["weekMinutes", 5, { code: "weekMinutes.invalid", min: 15, max: 240 }],
    ["weekMinutes", 61.5, { code: "weekMinutes.invalid", min: 15, max: 240 }],
    ["weekDecisions", 0, { code: "weekDecisions.invalid", min: 1, max: 20 }],
    ["acuteDays", 15, { code: "acuteDays.invalid", min: 0, max: 14 }],
  ] as const)("falls back for %s %j with its issue", (key, value, issue) => {
    const result = decodeSettings({ ...valid, [key]: value });
    expect(result.settings[key]).toBe(DEFAULT_SETTINGS[key]);
    expect(result.issues).toEqual([issue]);
  });

  it("refuses a patch out of range, all or nothing", () => {
    expect(validatePatch(valid, { weekDecisions: 21, weekMinutes: 30 })).toEqual({
      ok: false,
      issues: [{ code: "weekDecisions.invalid", min: 1, max: 20 }],
    });
  });
});

describe("decodeSettings", () => {
  it.each([undefined, null])("treats %s as a first run", (raw) => {
    expect(decodeSettings(raw)).toEqual({ settings: DEFAULT_SETTINGS, issues: [], writable: true });
  });

  it.each(["x", 42, []])("replaces a non-object %j with defaults and one issue", (raw) => {
    const result = decodeSettings(raw);
    expect(result.settings).toEqual(DEFAULT_SETTINGS);
    expect(result.writable).toBe(true);
    expect(result.issues).toHaveLength(1);
  });

  it("keeps a valid object unchanged", () => {
    expect(decodeSettings(valid)).toEqual({ settings: valid, issues: [], writable: true });
  });

  it("falls back per field and names the invalid field", () => {
    const result = decodeSettings({ schemaVersion: 1, rootFolder: 7, logLevel: "debug" });
    expect(result.settings.rootFolder).toBe(DEFAULT_SETTINGS.rootFolder);
    expect(result.settings.logLevel).toBe("debug");
    expect(result.issues).toEqual([ROOT_FOLDER_ISSUE]);
    expect(result.writable).toBe(true);
  });

  it("drops unknown keys", () => {
    const result = decodeSettings({ ...valid, extra: true });
    expect(result.settings).toEqual(valid);
    expect(Object.keys(result.settings).toSorted()).toEqual(Object.keys(valid).toSorted());
    expect(result.issues).toEqual([]);
  });

  it("falls back for an unknown log level and keeps the other fields", () => {
    const result = decodeSettings({ ...valid, logLevel: "verbose" });
    expect(result.settings).toEqual({ ...valid, logLevel: "warn" });
    expect(result.issues).toEqual([{ code: "logLevel.unknown", allowed: LOG_LEVELS }]);
  });

  it.each([true, false, "yes"])(
    "drops the retired showRibbonIcon %j of an older file without an issue",
    (showRibbonIcon) => {
      expect(decodeSettings({ ...valid, showRibbonIcon })).toEqual({
        settings: valid,
        issues: [],
        writable: true,
      });
    },
  );

  it("treats a missing schemaVersion as the current version", () => {
    const { schemaVersion: _omitted, ...rest } = valid;
    expect(decodeSettings(rest)).toEqual({ settings: valid, issues: [], writable: true });
  });

  it("loads defaults read-only when written by a newer version", () => {
    const result = decodeSettings({ ...valid, schemaVersion: 2 });
    expect(result.settings).toEqual(DEFAULT_SETTINGS);
    expect(result.writable).toBe(false);
    expect(result.readOnlyReason).toBe("newer-version");
    expect(result.issues).toEqual([{ code: "schema.newer", version: 2 }]);
  });

  it("rejects a schemaVersion that is not a positive integer", () => {
    const result = decodeSettings({ ...valid, schemaVersion: "1" });
    expect(result.settings).toEqual(valid);
    expect(result.writable).toBe(true);
    expect(result.issues).toEqual([{ code: "schema.invalid" }]);
  });

  it("never throws and is idempotent on its own output, also once encoded", () => {
    assert(
      property(anything(), (raw) => {
        const first = decodeSettings(raw);
        const again = { settings: first.settings, issues: [], writable: true };
        expect(decodeSettings(first.settings)).toEqual(again);
        expect(decodeSettings(encodeSettings(first.settings))).toEqual(again);
      }),
    );
  });

  it("exposes the supported log levels in severity order", () => {
    expect(LOG_LEVELS).toEqual(["error", "warn", "info", "debug"]);
    expect(SETTINGS_VERSION).toBe(1);
  });
});

describe("validatePatch", () => {
  it("returns the current settings for an empty patch", () => {
    expect(validatePatch(valid, {})).toEqual({ ok: true, settings: valid });
  });

  it("applies a valid patch and normalises the root folder", () => {
    expect(validatePatch(valid, { rootFolder: " /Archiv/ ", logLevel: "info" })).toEqual({
      ok: true,
      settings: { ...valid, rootFolder: "Archiv", logLevel: "info" },
    });
  });

  it.each(["", "a/../b"])("rejects the root folder %j", (rootFolder) => {
    expect(validatePatch(valid, { rootFolder })).toEqual({
      ok: false,
      issues: [ROOT_FOLDER_ISSUE],
    });
  });

  it("rejects an unknown log level", () => {
    const result = validatePatch(valid, { logLevel: "loud" as Settings["logLevel"] });
    expect(result.ok).toBe(false);
  });

  it("always keeps schemaVersion 1", () => {
    const patch = { schemaVersion: 7, logLevel: "info" } as unknown as Parameters<
      typeof validatePatch
    >[1];
    const result = validatePatch(valid, patch);
    expect(result).toEqual({ ok: true, settings: { ...valid, logLevel: "info" } });
  });
});

/** Defaults are product decisions; pin them exactly. Issue texts live in the message catalog. */
describe("settings defaults and issues", () => {
  it("has the documented defaults", () => {
    expect(DEFAULT_SETTINGS).toEqual({
      schemaVersion: 1,
      logLevel: "warn",
      rootFolder: "WEG Manager",
      weekStart: "monday",
      weekMinutes: 60,
      weekDecisions: 7,
      acuteDays: 2,
    });
  });

  it("names the issue for a non-object file and an unknown log level as codes", () => {
    expect(decodeSettings("x").issues).toEqual([{ code: "file.invalid" }]);
    expect(decodeSettings({ logLevel: "laut" }).issues).toEqual([
      { code: "logLevel.unknown", allowed: ["error", "warn", "info", "debug"] },
    ]);
  });

  it("writes the version and the log level, and the root folder only when it is not the default", () => {
    expect(encodeSettings(DEFAULT_SETTINGS)).toEqual({ schemaVersion: 1, logLevel: "warn" });
    expect(Object.keys(encodeSettings(valid))).toEqual(["schemaVersion", "logLevel", "rootFolder"]);
  });
});

/**
 * The demo greeting of versions before 0.2 is gone (PBI-56). An old file still holds the key; it
 * is an unknown key now: dropped on decode without an issue, and never written again.
 */
describe("the retired greeting", () => {
  it.each(["Hello from WEG Manager", "Moin", "", 7, null])(
    "drops a greeting %j without an issue",
    (greeting) => {
      expect(decodeSettings({ ...valid, greeting })).toEqual({
        settings: valid,
        issues: [],
        writable: true,
      });
    },
  );

  it("writes no greeting key after a file that held one is decoded", () => {
    const old = { schemaVersion: 1, greeting: "Moin", logLevel: "warn" };
    const { settings } = decodeSettings(old);
    expect(encodeSettings(settings)).toEqual({ schemaVersion: 1, logLevel: "warn" });
  });
});
