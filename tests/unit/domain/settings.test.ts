import { anything, assert, property } from "fast-check";
import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  GREETING_MAX_LENGTH,
  LOG_LEVELS,
  SETTINGS_VERSION,
  decodeSettings,
  validatePatch,
  type Settings,
} from "../../../src/domain/settings";

const valid: Settings = {
  schemaVersion: 1,
  greeting: "Moin",
  showRibbonIcon: false,
  logLevel: "debug",
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
    const result = decodeSettings({ schemaVersion: 1, greeting: 7, showRibbonIcon: false });
    expect(result.settings.greeting).toBe(DEFAULT_SETTINGS.greeting);
    expect(result.settings.showRibbonIcon).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain("Begrüßung");
    expect(result.writable).toBe(true);
  });

  it.each(["", "   ", "x".repeat(GREETING_MAX_LENGTH + 1)])(
    "rejects the greeting %j with one issue",
    (greeting) => {
      const result = decodeSettings({ ...valid, greeting });
      expect(result.settings.greeting).toBe(DEFAULT_SETTINGS.greeting);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0]).toContain("Begrüßung");
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
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain("Protokollstufe");
  });

  it("falls back for a non-boolean ribbon flag", () => {
    const result = decodeSettings({ ...valid, showRibbonIcon: "yes" });
    expect(result.settings.showRibbonIcon).toBe(DEFAULT_SETTINGS.showRibbonIcon);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain("Menüband-Symbol");
  });

  it("treats a missing schemaVersion as the current version", () => {
    const { schemaVersion: _omitted, ...rest } = valid;
    expect(decodeSettings(rest)).toEqual({ settings: valid, issues: [], writable: true });
  });

  it("loads defaults read-only when written by a newer version", () => {
    const result = decodeSettings({ ...valid, schemaVersion: 2 });
    expect(result.settings).toEqual(DEFAULT_SETTINGS);
    expect(result.writable).toBe(false);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain("2");
  });

  it("rejects a schemaVersion that is not a positive integer", () => {
    const result = decodeSettings({ ...valid, schemaVersion: "1" });
    expect(result.settings).toEqual(valid);
    expect(result.writable).toBe(true);
    expect(result.issues).toHaveLength(1);
    expect(result.issues[0]).toContain("Schemaversion");
  });

  it("never throws and is idempotent on its own output", () => {
    assert(
      property(anything(), (raw) => {
        const first = decodeSettings(raw);
        expect(decodeSettings(first.settings)).toEqual({
          settings: first.settings,
          issues: [],
          writable: true,
        });
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
    expect(validatePatch(valid, { greeting: "  Hallo ", showRibbonIcon: true })).toEqual({
      ok: true,
      settings: { ...valid, greeting: "Hallo", showRibbonIcon: true },
    });
  });

  it.each(["", "x".repeat(GREETING_MAX_LENGTH + 1)])("rejects the greeting %j", (greeting) => {
    expect(validatePatch(valid, { greeting })).toEqual({
      ok: false,
      issues: [expect.stringContaining("Begrüßung")],
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

/** Defaults and issue texts are product decisions; pin them exactly. */
describe("settings copy and defaults", () => {
  it("has the documented defaults", () => {
    expect(DEFAULT_SETTINGS).toEqual({
      schemaVersion: 1,
      greeting: "Hello from WEG Manager",
      showRibbonIcon: true,
      logLevel: "warn",
    });
  });

  it("names the issue for a non-object file and an unknown log level exactly", () => {
    expect(decodeSettings("x").issues).toEqual([
      "Die Einstellungsdatei enthält keine gültigen Einstellungen.",
    ]);
    expect(decodeSettings({ logLevel: "laut" }).issues).toEqual([
      "Die Protokollstufe muss eine von error, warn, info, debug sein.",
    ]);
  });
});
