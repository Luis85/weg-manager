import { Schema, SchemaGetter } from "effect";
import {
  StructuralIssue,
  makeSettingsCodec,
  type DecodedSettings as CodecDecoded,
  type Migrations,
  type PatchResult as CodecPatchResult,
  type SettingsFields,
} from "./settings-codec";

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

/**
 * A broken rule, as data: the domain knows no language. The message catalog turns each `code`
 * into a sentence (`src/application/shell/i18n/`). The file-level codes come from the codec.
 */
export const SettingsIssue = Schema.Union([
  StructuralIssue,
  Schema.Struct({ code: Schema.Literal("greeting.length"), max: Schema.Number }),
  Schema.Struct({
    code: Schema.Literal("logLevel.unknown"),
    allowed: Schema.Array(Schema.Literals(LOG_LEVELS)),
  }),
]);

export type SettingsIssue = typeof SettingsIssue.Type;

type FieldIssue = Exclude<SettingsIssue, StructuralIssue>;

export type DecodedSettings = CodecDecoded<Settings, FieldIssue>;
export type PatchResult = CodecPatchResult<Settings, FieldIssue>;

/** Trimmed, 1 to 200 characters; the legacy default and `null` both mean "not customised". */
const Greeting = Schema.NullOr(
  Schema.Trim.check(Schema.isNonEmpty(), Schema.isMaxLength(GREETING_MAX_LENGTH)),
).pipe(
  Schema.decodeTo(Schema.NullOr(Schema.String), {
    decode: SchemaGetter.transform((value) => (value === LEGACY_DEFAULT_GREETING ? null : value)),
    encode: SchemaGetter.passthrough(),
  }),
);

/**
 * One declaration per setting: its schema, its default, the issue a bad value produces and whether
 * a default stays out of the file. Decode, patch validation and encode all follow from this.
 * A greeting that is not customised is left out of the file, so it reads the same in every plugin
 * version: older ones fall back to their own default without an issue.
 */
const FIELDS: SettingsFields<EditableSettings, FieldIssue> = {
  greeting: {
    schema: Greeting,
    default: null,
    issue: { code: "greeting.length", max: GREETING_MAX_LENGTH },
    omitWhenDefault: true,
  },
  logLevel: {
    schema: Schema.Literals(LOG_LEVELS),
    default: "warn",
    issue: { code: "logLevel.unknown", allowed: LOG_LEVELS },
    omitWhenDefault: false,
  },
};

/** Empty: version 1 is the only one so far. A future bump adds `1: (raw) => …` here. */
const MIGRATIONS: Migrations = {};

const codec = makeSettingsCodec({
  version: SETTINGS_VERSION,
  fields: FIELDS,
  migrations: MIGRATIONS,
});

export const DEFAULT_SETTINGS: Settings = codec.defaults;

/**
 * Decodes `data.json` content. Never throws. Invalid fields fall back one by one; a file written by a
 * newer plugin version loads defaults and is marked read-only so it is never overwritten.
 */
export const decodeSettings = (raw: unknown): DecodedSettings => codec.decode(raw);

/** What goes into `data.json`; defaults that may stay out do. */
export const encodeSettings = (settings: Settings): Record<string, unknown> =>
  codec.encode(settings);

/** Applies a patch of editable fields; the result is all-or-nothing. */
export const validatePatch = (current: Settings, patch: Partial<EditableSettings>): PatchResult =>
  codec.validatePatch(current, patch);
