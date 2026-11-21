import { describe, expect, it } from "vitest";
import {
  DEFAULT_ROOT_FOLDER,
  DEFAULT_SETTINGS,
  ROOT_FOLDER_MAX_LENGTH,
  decodeSettings,
  encodeSettings,
  validatePatch,
  type Settings,
} from "../../../../src/domain/shell/settings";

const issue = { code: "rootFolder.invalid", max: ROOT_FOLDER_MAX_LENGTH } as const;

const rootOf = (rootFolder: unknown) => decodeSettings({ rootFolder });

describe("the root folder setting", () => {
  it("defaults to WEG Manager, without a file entry", () => {
    expect(DEFAULT_ROOT_FOLDER).toBe("WEG Manager");
    expect(DEFAULT_SETTINGS.rootFolder).toBe("WEG Manager");
    expect(decodeSettings({ schemaVersion: 1 }).settings.rootFolder).toBe("WEG Manager");
    expect(decodeSettings(undefined).settings.rootFolder).toBe("WEG Manager");
    expect(ROOT_FOLDER_MAX_LENGTH).toBe(100);
  });

  it.each([
    ["WEG Manager", "WEG Manager"],
    ["Beirat", "Beirat"],
    ["Beirat/WEG Manager", "Beirat/WEG Manager"],
    ["a/b/c/d", "a/b/c/d"],
    ["Ordner.v2", "Ordner.v2"],
    [".hidden", ".hidden"],
    ["a.b/..c/d..", "a.b/..c/d.."],
    ["Müller & Söhne/Gemeinschaft #1", "Müller & Söhne/Gemeinschaft #1"],
    ["  WEG Manager  ", "WEG Manager"],
    ["/WEG Manager", "WEG Manager"],
    ["WEG Manager/", "WEG Manager"],
    ["/WEG Manager/", "WEG Manager"],
    ["///a/b///", "a/b"],
    [" / a / b / ", "a/b"],
    ["a/ b /c", "a/b/c"],
    ["x".repeat(ROOT_FOLDER_MAX_LENGTH), "x".repeat(ROOT_FOLDER_MAX_LENGTH)],
  ])("reads %j as %j", (raw, expected) => {
    expect(rootOf(raw)).toEqual({
      settings: { ...DEFAULT_SETTINGS, rootFolder: expected },
      issues: [],
      writable: true,
    });
  });

  it.each([
    ["empty", ""],
    ["blank", "   "],
    ["only a slash", "/"],
    ["only slashes", "///"],
    ["a dot", "."],
    ["two dots", ".."],
    ["a dot segment", "a/./b"],
    ["a parent segment", "a/../b"],
    ["a leading parent segment", "../a"],
    ["a trailing parent segment", "a/.."],
    ["a padded dot segment", "a/ . /b"],
    ["an empty segment", "a//b"],
    ["a blank segment", "a/ /b"],
    ["a backslash", "a\\b"],
    ["a Windows path", "C:\\Users\\me"],
    ["a drive letter", "C:/Users"],
    ["an asterisk", "a*b"],
    ["a double quote", 'a"b'],
    ["a less-than sign", "a<b"],
    ["a greater-than sign", "a>b"],
    ["a colon", "a:b"],
    ["a pipe", "a|b"],
    ["a question mark", "a?b"],
    ["a tab", "a\tb"],
    ["a line break", "a\nb"],
    ["a null character", "a\u0000b"],
    ["too many characters", "x".repeat(ROOT_FOLDER_MAX_LENGTH + 1)],
    ["too many characters after a slash", "/" + "x".repeat(ROOT_FOLDER_MAX_LENGTH + 1)],
    ["a number", 7],
    ["null", null],
    ["a list", ["WEG"]],
    ["an object", { path: "WEG" }],
    ["a boolean", true],
  ])("rejects %s and falls back alone: %j", (_label, raw) => {
    const result = decodeSettings({ schemaVersion: 1, greeting: "Moin", rootFolder: raw });
    expect(result.settings).toEqual({ ...DEFAULT_SETTINGS, greeting: "Moin" });
    expect(result.issues).toEqual([issue]);
    expect(result.writable).toBe(true);
  });

  it("falls back to the default, not to a value kept from before, with other issues in field order", () => {
    const result = decodeSettings({ greeting: "", logLevel: "loud", rootFolder: "a/../b" });
    expect(result.issues).toEqual([
      { code: "greeting.length", max: 200 },
      { code: "logLevel.unknown", allowed: ["error", "warn", "info", "debug"] },
      issue,
    ]);
  });

  it("allows the maximum length counted after normalising", () => {
    const folder = "x".repeat(ROOT_FOLDER_MAX_LENGTH);
    expect(rootOf(`  /${folder}/  `).settings.rootFolder).toBe(folder);
  });
});

describe("the root folder in encode and validatePatch", () => {
  const custom: Settings = { ...DEFAULT_SETTINGS, rootFolder: "Beirat/WEG" };

  it("is written only when it differs from the default, after the other fields", () => {
    expect(encodeSettings(DEFAULT_SETTINGS)).toEqual({ schemaVersion: 1, logLevel: "warn" });
    expect(encodeSettings({ ...custom, greeting: "Moin", logLevel: "info" })).toEqual({
      schemaVersion: 1,
      greeting: "Moin",
      logLevel: "info",
      rootFolder: "Beirat/WEG",
    });
    expect(Object.keys(encodeSettings({ ...custom, greeting: "Moin" }))).toEqual([
      "schemaVersion",
      "greeting",
      "logLevel",
      "rootFolder",
    ]);
    expect(Object.keys(encodeSettings(custom))).toEqual([
      "schemaVersion",
      "logLevel",
      "rootFolder",
    ]);
  });

  it("is kept by a save of another setting", () => {
    const result = validatePatch(custom, { logLevel: "debug" });
    expect(result).toEqual({ ok: true, settings: { ...custom, logLevel: "debug" } });
  });

  it("is normalised by a patch", () => {
    expect(validatePatch(DEFAULT_SETTINGS, { rootFolder: " /Beirat/WEG/ " })).toEqual({
      ok: true,
      settings: custom,
    });
  });

  it.each(["", "a/../b", "a:b", "x".repeat(ROOT_FOLDER_MAX_LENGTH + 1)])(
    "rejects the patch %j as a whole, even next to a valid change",
    (rootFolder) => {
      expect(validatePatch(DEFAULT_SETTINGS, { rootFolder, logLevel: "debug" })).toEqual({
        ok: false,
        issues: [issue],
      });
    },
  );

  it("reads a default root folder written explicitly as the default, and saves it without the key", () => {
    const decoded = decodeSettings({ schemaVersion: 1, rootFolder: "WEG Manager" });
    expect(decoded).toEqual({ settings: DEFAULT_SETTINGS, issues: [], writable: true });
    expect(encodeSettings(decoded.settings)).toEqual({ schemaVersion: 1, logLevel: "warn" });
  });
});
