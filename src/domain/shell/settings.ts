import { Schema } from "effect";
import { DEFAULT_ROOT_FOLDER, ROOT_FOLDER_MAX_LENGTH, RootFolder } from "./root-folder";
import {
  StructuralIssue,
  makeSettingsCodec,
  type Decoded,
  type Migrations,
  type PatchOutcome,
  type SettingsFields,
} from "./settings-codec";

export { DEFAULT_ROOT_FOLDER, ROOT_FOLDER_MAX_LENGTH };

export const SETTINGS_VERSION = 1;
export const LOG_LEVELS = ["error", "warn", "info", "debug"] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export type Settings = {
  readonly schemaVersion: 1;
  readonly logLevel: LogLevel;
  /** Vault-relative folder of the plugin's notes. No interface edits it yet (ADR 0007). */
  readonly rootFolder: string;
};

export type EditableSettings = Omit<Settings, "schemaVersion">;

/**
 * A broken rule, as data: the domain knows no language. The message catalog turns each `code`
 * into a sentence (`src/application/shell/i18n/`). The file-level codes come from the codec.
 */
export const SettingsIssue = Schema.Union([
  StructuralIssue,
  Schema.Struct({
    code: Schema.Literal("logLevel.unknown"),
    allowed: Schema.Array(Schema.Literals(LOG_LEVELS)),
  }),
  Schema.Struct({ code: Schema.Literal("rootFolder.invalid"), max: Schema.Number }),
]);

export type SettingsIssue = typeof SettingsIssue.Type;

type FieldIssue = Exclude<SettingsIssue, StructuralIssue>;

export type DecodedSettings = Decoded<Settings, FieldIssue>;
export type PatchResult = PatchOutcome<Settings, FieldIssue>;

/**
 * One declaration per setting: its schema, its default, the issue a bad value produces and whether
 * a default stays out of the file. Decode, patch validation and encode all follow from this.
 * A root folder that is still the default is left out of the file, so it reads the same in every
 * plugin version: older ones fall back to their own default without an issue. A key no field
 * declares, such as the `greeting` of versions before 0.2, is dropped on decode and never written.
 */
const FIELDS: SettingsFields<EditableSettings, FieldIssue> = {
  logLevel: {
    schema: Schema.Literals(LOG_LEVELS),
    default: "warn",
    issue: { code: "logLevel.unknown", allowed: LOG_LEVELS },
    omitWhenDefault: false,
  },
  rootFolder: {
    schema: RootFolder,
    default: DEFAULT_ROOT_FOLDER,
    issue: { code: "rootFolder.invalid", max: ROOT_FOLDER_MAX_LENGTH },
    omitWhenDefault: true,
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
