import { anything, assert, property } from "fast-check";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  GREETING_MAX_LENGTH,
  LOG_LEVELS,
  SETTINGS_VERSION,
  decodeSettings,
  LEGACY_DEFAULT_GREETING,
  encodeSettings,
  validatePatch,
  type Settings,
} from "../../../../src/domain/shell/settings";

const valid: Settings = {
  schemaVersion: 1,
  greeting: "Moin",
  logLevel: "debug",
  rootFolder: "Beirat/WEG",
};

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
    const result = decodeSettings({ schemaVersion: 1, greeting: 7, logLevel: "debug" });
    expect(result.settings.greeting).toBe(DEFAULT_SETTINGS.greeting);
    expect(result.settings.logLevel).toBe("debug");
    expect(result.issues).toEqual([{ code: "greeting.length", max: GREETING_MAX_LENGTH }]);
    expect(result.writable).toBe(true);
  });

  it.each(["", "   ", "x".repeat(GREETING_MAX_LENGTH + 1)])(
    "rejects the greeting %j with one issue",
    (greeting) => {
      const result = decodeSettings({ ...valid, greeting });
      expect(result.settings.greeting).toBe(DEFAULT_SETTINGS.greeting);
      expect(result.issues).toEqual([{ code: "greeting.length", max: GREETING_MAX_LENGTH }]);
    },
  );

  it("accepts a greeting of exactly the maximum length", () => {
    const greeting = "x".repeat(GREETING_MAX_LENGTH);
    expect(decodeSettings({ ...valid, greeting }).settings.greeting).toBe(greeting);
  });

  it("stores a valid greeting trimmed", () => {
    expect(decodeSettings({ ...valid, greeting: "  Moin  " }).settings.greeting).toBe("Moin");
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

  it("applies a valid patch and trims the greeting", () => {
    expect(validatePatch(valid, { greeting: "  Hallo ", logLevel: "info" })).toEqual({
      ok: true,
      settings: { ...valid, greeting: "Hallo", logLevel: "info" },
    });
  });

  it.each(["", "x".repeat(GREETING_MAX_LENGTH + 1)])("rejects the greeting %j", (greeting) => {
    expect(validatePatch(valid, { greeting })).toEqual({
      ok: false,
      issues: [{ code: "greeting.length", max: GREETING_MAX_LENGTH }],
    });
  });

  it("resets the greeting to the language's default with null", () => {
    expect(validatePatch(valid, { greeting: null })).toEqual({
      ok: true,
      settings: { ...valid, greeting: null },
    });
  });

  it("treats the old English default as not customised", () => {
    expect(validatePatch(valid, { greeting: ` ${LEGACY_DEFAULT_GREETING} ` })).toEqual({
      ok: true,
      settings: { ...valid, greeting: null },
    });
  });

  it("rejects an unknown log level", () => {
    const result = validatePatch(valid, { logLevel: "loud" as Settings["logLevel"] });
    expect(result.ok).toBe(false);
  });

  it("always keeps schemaVersion 1", () => {
    const patch = { schemaVersion: 7, greeting: "Hi" } as unknown as Parameters<
      typeof validatePatch
    >[1];
    const result = validatePatch(valid, patch);
    expect(result).toEqual({ ok: true, settings: { ...valid, greeting: "Hi" } });
  });
});

/** Defaults are product decisions; pin them exactly. Issue texts live in the message catalog. */
describe("settings defaults and issues", () => {
  it("has the documented defaults: no greeting stored, so it follows the UI language", () => {
    expect(DEFAULT_SETTINGS).toEqual({
      schemaVersion: 1,
      greeting: null,
      logLevel: "warn",
      rootFolder: "WEG Manager",
    });
    expect(LEGACY_DEFAULT_GREETING).toBe("Hello from WEG Manager");
  });

  it("names the issue for a non-object file and an unknown log level as codes", () => {
    expect(decodeSettings("x").issues).toEqual([{ code: "file.invalid" }]);
    expect(decodeSettings({ logLevel: "laut" }).issues).toEqual([
      { code: "logLevel.unknown", allowed: ["error", "warn", "info", "debug"] },
    ]);
  });
});

/** Files written before 0.2 stored the English default greeting; it is not a customisation. */
describe("default greeting", () => {
  it("reads a file without a greeting as not customised", () => {
    expect(decodeSettings({ schemaVersion: 1, logLevel: "info" }).settings.greeting).toBeNull();
  });

  it("reads the old stored default as not customised, without an issue", () => {
    const old = { schemaVersion: 1, greeting: "Hello from WEG Manager", logLevel: "warn" };
    expect(decodeSettings(old)).toEqual({ settings: DEFAULT_SETTINGS, issues: [], writable: true });
  });

  it("reads an explicit null as not customised", () => {
    expect(decodeSettings({ ...valid, greeting: null })).toEqual({
      settings: { ...valid, greeting: null },
      issues: [],
      writable: true,
    });
  });

  it("keeps a typed greeting, also one that merely contains the old default", () => {
    const greeting = "Hello from WEG Manager!";
    expect(decodeSettings({ ...valid, greeting }).settings.greeting).toBe(greeting);
  });

  it("writes no greeting key while the greeting is not customised", () => {
    expect(encodeSettings(DEFAULT_SETTINGS)).toEqual({ schemaVersion: 1, logLevel: "warn" });
    expect(encodeSettings(valid)).toEqual(valid);
    expect(Object.keys(encodeSettings(valid))).toEqual([
      "schemaVersion",
      "greeting",
      "logLevel",
      "rootFolder",
    ]);
  });
});
