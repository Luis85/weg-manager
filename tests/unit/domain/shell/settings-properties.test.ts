import {
  anything,
  array,
  assert,
  constantFrom,
  dictionary,
  oneof,
  property,
  record,
  string,
  stringMatching,
  type Arbitrary,
} from "fast-check";
import { describe, expect, it } from "vitest";
import {
  GREETING_MAX_LENGTH,
  LEGACY_DEFAULT_GREETING,
  LOG_LEVELS,
  ROOT_FOLDER_MAX_LENGTH,
  decodeSettings,
  encodeSettings,
  validatePatch,
  type EditableSettings,
  type Settings,
} from "../../../../src/domain/shell/settings";

const isControl = (code: number): boolean => code < 0x20 || (code >= 0x7f && code <= 0x9f);

/** Written out independently of the implementation: what a stored root folder must look like. */
const isNormalisedFolder = (value: string): boolean =>
  value.length > 0 &&
  value.length <= ROOT_FOLDER_MAX_LENGTH &&
  value
    .split("/")
    .every(
      (segment) =>
        segment.length > 0 &&
        segment === segment.trim() &&
        segment !== "." &&
        segment !== ".." &&
        !/[*"\\<>:|?]/.test(segment) &&
        ![...segment].some((char) => isControl(char.codePointAt(0) ?? 0)),
    );

const isValid = (settings: Settings): boolean =>
  settings.schemaVersion === 1 &&
  (settings.greeting === null ||
    (settings.greeting.length >= 1 &&
      settings.greeting.length <= GREETING_MAX_LENGTH &&
      settings.greeting === settings.greeting.trim() &&
      settings.greeting !== LEGACY_DEFAULT_GREETING)) &&
  LOG_LEVELS.includes(settings.logLevel) &&
  isNormalisedFolder(settings.rootFolder);

const segment = stringMatching(/^[A-Za-z0-9ÄÖÜäöüß_-][A-Za-z0-9ÄÖÜäöüß _.-]{0,8}[A-Za-z0-9_-]$/);

const validSettings: Arbitrary<Settings> = record({
  schemaVersion: constantFrom(1 as const),
  greeting: oneof(
    constantFrom(null),
    stringMatching(/^[A-Za-zÄÖÜäöüß!?,.][A-Za-zÄÖÜäöüß !?,.]{0,60}[A-Za-zÄÖÜäöüß!?,.]$/).filter(
      (text) => text !== LEGACY_DEFAULT_GREETING,
    ),
  ),
  logLevel: constantFrom(...LOG_LEVELS),
  rootFolder: array(segment, { minLength: 1, maxLength: 4 })
    .map((parts) => parts.join("/"))
    .filter((path) => path.length <= ROOT_FOLDER_MAX_LENGTH),
});

/** Arbitrary files that look like settings: the right keys with arbitrary values, plus noise. */
const settingsLikeFile = record(
  {
    schemaVersion: oneof(constantFrom(1, 0, 2, -1, 1.5), anything()),
    greeting: oneof(string({ maxLength: 260 }), anything()),
    logLevel: oneof(constantFrom(...LOG_LEVELS), anything()),
    rootFolder: oneof(string({ maxLength: 130 }), anything()),
  },
  { requiredKeys: [] },
);

describe("settings properties", () => {
  it("decodes any input without throwing, to valid settings, writable unless newer", () => {
    assert(
      property(oneof(anything(), settingsLikeFile, dictionary(string(), anything())), (raw) => {
        const result = decodeSettings(raw);
        expect(isValid(result.settings)).toBe(true);
        expect(result.writable).toBe(!result.issues.some((entry) => entry.code === "schema.newer"));
      }),
    );
  });

  it("reads a file it wrote without any issue", () => {
    assert(
      property(validSettings, (settings) => {
        expect(decodeSettings(encodeSettings(settings))).toEqual({
          settings,
          issues: [],
          writable: true,
        });
      }),
    );
  });

  it("encodes and decodes valid settings to the identity, also through JSON", () => {
    assert(
      property(validSettings, (settings) => {
        const file: unknown = JSON.parse(JSON.stringify(encodeSettings(settings)));
        expect(decodeSettings(file).settings).toEqual(settings);
      }),
    );
  });

  it("encodes only keys an older version knows, plus the root folder when it is not the default", () => {
    assert(
      property(validSettings, (settings) => {
        const keys = Object.keys(encodeSettings(settings));
        expect(keys).toContain("schemaVersion");
        expect(keys).toContain("logLevel");
        expect(keys.includes("greeting")).toBe(settings.greeting !== null);
        expect(keys.includes("rootFolder")).toBe(settings.rootFolder !== "WEG Manager");
      }),
    );
  });

  it("applies any valid patch as the decode of the merge, and rejects it as a whole otherwise", () => {
    assert(
      property(validSettings, oneof(validSettings, settingsLikeFile), (current, source) => {
        const patch = Object.fromEntries(
          Object.entries(source).filter(([key]) => key !== "schemaVersion"),
        ) as unknown as Partial<EditableSettings>;
        const merged = decodeSettings({ ...current, ...patch });
        expect(isValid(merged.settings)).toBe(true);
        expect(validatePatch(current, patch)).toEqual(
          merged.issues.length === 0
            ? { ok: true, settings: merged.settings }
            : { ok: false, issues: merged.issues },
        );
      }),
    );
  });
});
