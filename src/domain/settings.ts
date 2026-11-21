import { Option, Schema } from "effect";

export const SETTINGS_VERSION = 1;
export const GREETING_MAX_LENGTH = 200;
export const LOG_LEVELS = ["error", "warn", "info", "debug"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export type Settings = {
  readonly schemaVersion: 1;
  readonly greeting: string;
  readonly showRibbonIcon: boolean;
  readonly logLevel: LogLevel;
};

export type EditableSettings = Omit<Settings, "schemaVersion">;

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: SETTINGS_VERSION,
  greeting: "Hello from WEG Manager",
  showRibbonIcon: true,
  logLevel: "warn",
};

export type DecodedSettings = {
  readonly settings: Settings;
  readonly issues: readonly string[];
  readonly writable: boolean;
};

export type PatchResult =
  | { readonly ok: true; readonly settings: Settings }
  | { readonly ok: false; readonly issues: readonly string[] };

type FieldResult<A> =
  { readonly ok: true; readonly value: A } | { readonly ok: false; readonly issue: string };

const Greeting = Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(GREETING_MAX_LENGTH));
const decodeGreeting = Schema.decodeUnknownOption(Greeting);
const isBoolean = Schema.is(Schema.Boolean);
const isLogLevel = Schema.is(Schema.Literals(LOG_LEVELS));
const isVersion = Schema.is(Schema.Int.check(Schema.isGreaterThan(0)));

const greetingField = (raw: unknown): FieldResult<string> => {
  const decoded = decodeGreeting(raw);
  return Option.isSome(decoded)
    ? { ok: true, value: decoded.value }
    : { ok: false, issue: `Die Begrüßung muss 1 bis ${GREETING_MAX_LENGTH} Zeichen lang sein.` };
};

const ribbonField = (raw: unknown): FieldResult<boolean> =>
  isBoolean(raw)
    ? { ok: true, value: raw }
    : { ok: false, issue: "Das Menüband-Symbol muss ein- oder ausgeschaltet sein." };

const logLevelField = (raw: unknown): FieldResult<LogLevel> =>
  isLogLevel(raw)
    ? { ok: true, value: raw }
    : { ok: false, issue: `Die Protokollstufe muss eine von ${LOG_LEVELS.join(", ")} sein.` };

const orDefault = <A>(result: FieldResult<A>, fallback: A, issues: string[]): A => {
  if (result.ok) return result.value;
  issues.push(result.issue);
  return fallback;
};

const isRecord = (raw: unknown): raw is Record<string, unknown> =>
  typeof raw === "object" && raw !== null && !Array.isArray(raw);

const decodeFields = (raw: Record<string, unknown>, issues: string[]): Settings => ({
  schemaVersion: SETTINGS_VERSION,
  greeting:
    "greeting" in raw
      ? orDefault(greetingField(raw["greeting"]), DEFAULT_SETTINGS.greeting, issues)
      : DEFAULT_SETTINGS.greeting,
  showRibbonIcon:
    "showRibbonIcon" in raw
      ? orDefault(ribbonField(raw["showRibbonIcon"]), DEFAULT_SETTINGS.showRibbonIcon, issues)
      : DEFAULT_SETTINGS.showRibbonIcon,
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
    return {
      settings: DEFAULT_SETTINGS,
      issues: ["Die Einstellungsdatei enthält keine gültigen Einstellungen."],
      writable: true,
    };
  }
  const version = raw["schemaVersion"];
  if (version !== undefined && isVersion(version) && version > SETTINGS_VERSION) {
    return {
      settings: DEFAULT_SETTINGS,
      issues: [
        `Die Einstellungen stammen aus einer neueren Plugin-Version (Schemaversion ${version}).`,
      ],
      writable: false,
    };
  }
  const issues: string[] = [];
  if (version !== undefined && !isVersion(version))
    issues.push("Die Schemaversion muss eine positive ganze Zahl sein.");
  return { settings: decodeFields(raw, issues), issues, writable: true };
};

/** Applies a patch of editable fields; the result is all-or-nothing. */
export const validatePatch = (current: Settings, patch: Partial<EditableSettings>): PatchResult => {
  const merged: Record<string, unknown> = { ...current, ...patch, schemaVersion: SETTINGS_VERSION };
  const issues: string[] = [];
  const settings = decodeFields(merged, issues);
  return issues.length === 0 ? { ok: true, settings } : { ok: false, issues };
};
