import { Option, Schema } from "effect";

export const SETTINGS_VERSION = 1;
export const GREETING_MAX_LENGTH = 200;
export const LOG_LEVELS = ["error", "warn", "info", "debug"] as const;

/**
 * The default greeting that versions before 0.2 wrote into `data.json`. Read as "not customised",
 * so those files show the greeting of the current UI language too (ADR 0005).
 */
export const LEGACY_DEFAULT_GREETING = "Hello from WEG Manager";

export type LogLevel = (typeof LOG_LEVELS)[number];

export type Settings = {
  readonly schemaVersion: 1;
  /** `null`: not customised, the view shows the default greeting of the UI language. */
  readonly greeting: string | null;
  readonly logLevel: LogLevel;
};

export type EditableSettings = Omit<Settings, "schemaVersion">;

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: SETTINGS_VERSION,
  greeting: null,
  logLevel: "warn",
};

/**
 * A broken rule, as data: the domain knows no language. The message catalog turns each `code`
 * into a sentence (`src/application/i18n/`).
 */
export const SettingsIssue = Schema.Union([
  Schema.Struct({ code: Schema.Literal("file.invalid") }),
  Schema.Struct({ code: Schema.Literal("schema.newer"), version: Schema.Number }),
  Schema.Struct({ code: Schema.Literal("schema.invalid") }),
  Schema.Struct({ code: Schema.Literal("greeting.length"), max: Schema.Number }),
  Schema.Struct({
    code: Schema.Literal("logLevel.unknown"),
    allowed: Schema.Array(Schema.Literals(LOG_LEVELS)),
  }),
]);

export type SettingsIssue = typeof SettingsIssue.Type;

export type DecodedSettings = {
  readonly settings: Settings;
  readonly issues: readonly SettingsIssue[];
  readonly writable: boolean;
};

export type PatchResult =
  | { readonly ok: true; readonly settings: Settings }
  | { readonly ok: false; readonly issues: readonly SettingsIssue[] };

type FieldResult<A> =
  { readonly ok: true; readonly value: A } | { readonly ok: false; readonly issue: SettingsIssue };

const Greeting = Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(GREETING_MAX_LENGTH));
const decodeGreeting = Schema.decodeUnknownOption(Greeting);
const isLogLevel = Schema.is(Schema.Literals(LOG_LEVELS));
const isVersion = Schema.is(Schema.Int.check(Schema.isGreaterThan(0)));

const greetingField = (raw: unknown): FieldResult<string | null> => {
  if (raw === null) return { ok: true, value: null };
  const decoded = decodeGreeting(raw);
  if (Option.isNone(decoded))
    return { ok: false, issue: { code: "greeting.length", max: GREETING_MAX_LENGTH } };
  return { ok: true, value: decoded.value === LEGACY_DEFAULT_GREETING ? null : decoded.value };
};

const logLevelField = (raw: unknown): FieldResult<LogLevel> =>
  isLogLevel(raw)
    ? { ok: true, value: raw }
    : { ok: false, issue: { code: "logLevel.unknown", allowed: LOG_LEVELS } };

const orDefault = <A>(result: FieldResult<A>, fallback: A, issues: SettingsIssue[]): A => {
  if (result.ok) return result.value;
  issues.push(result.issue);
  return fallback;
};

const isRecord = (raw: unknown): raw is Record<string, unknown> =>
  typeof raw === "object" && raw !== null && !Array.isArray(raw);

/** Reads the known fields only; unknown keys (such as the retired `showRibbonIcon`) are dropped. */
const decodeFields = (raw: Record<string, unknown>, issues: SettingsIssue[]): Settings => ({
  schemaVersion: SETTINGS_VERSION,
  greeting:
    "greeting" in raw
      ? orDefault(greetingField(raw["greeting"]), DEFAULT_SETTINGS.greeting, issues)
      : DEFAULT_SETTINGS.greeting,
  logLevel:
    "logLevel" in raw
      ? orDefault(logLevelField(raw["logLevel"]), DEFAULT_SETTINGS.logLevel, issues)
      : DEFAULT_SETTINGS.logLevel,
});

/**
 * Decodes `data.json` content. Never throws. Invalid fields fall back one by one; a file written by a
 * newer plugin version loads defaults and is marked read-only so it is never overwritten.
 */
export const decodeSettings = (raw: unknown): DecodedSettings => {
  if (raw === undefined || raw === null)
    return { settings: DEFAULT_SETTINGS, issues: [], writable: true };
  if (!isRecord(raw)) {
    return { settings: DEFAULT_SETTINGS, issues: [{ code: "file.invalid" }], writable: true };
  }
  const version = raw["schemaVersion"];
  if (version !== undefined && isVersion(version) && version > SETTINGS_VERSION) {
    return {
      settings: DEFAULT_SETTINGS,
      issues: [{ code: "schema.newer", version }],
      writable: false,
    };
  }
  const issues: SettingsIssue[] = [];
  if (version !== undefined && !isVersion(version)) issues.push({ code: "schema.invalid" });
  return { settings: decodeFields(raw, issues), issues, writable: true };
};

/**
 * What goes into `data.json`. A greeting that is not customised is left out, so the file reads the
 * same in every plugin version: older ones fall back to their own default without an issue.
 */
export const encodeSettings = (settings: Settings): Record<string, unknown> =>
  settings.greeting === null
    ? { schemaVersion: settings.schemaVersion, logLevel: settings.logLevel }
    : {
        schemaVersion: settings.schemaVersion,
        greeting: settings.greeting,
        logLevel: settings.logLevel,
      };

/** Applies a patch of editable fields; the result is all-or-nothing. */
export const validatePatch = (current: Settings, patch: Partial<EditableSettings>): PatchResult => {
  const merged: Record<string, unknown> = { ...current, ...patch, schemaVersion: SETTINGS_VERSION };
  const issues: SettingsIssue[] = [];
  const settings = decodeFields(merged, issues);
  return issues.length === 0 ? { ok: true, settings } : { ok: false, issues };
};
