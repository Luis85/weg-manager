import { Equal, Option, Predicate, Result, Schema } from "effect";

/**
 * Issues of the file as a whole: its shape, its version and its migration. The issues of single
 * settings come with each declaration.
 */
export const StructuralIssue = Schema.Union([
  Schema.Struct({ code: Schema.Literal("file.invalid") }),
  Schema.Struct({ code: Schema.Literal("schema.newer"), version: Schema.Number }),
  Schema.Struct({ code: Schema.Literal("schema.invalid") }),
  Schema.Struct({ code: Schema.Literal("migration.failed"), from: Schema.Number }),
]);

export type StructuralIssue = typeof StructuralIssue.Type;

type IssueLike = { readonly code: string };

/** Everything that is known about one setting. One declaration per setting drives all of it. */
export type FieldDeclaration<A, Issue extends IssueLike> = {
  /** Reads a raw JSON value into the in-memory one, normalising it (trim, legacy values). */
  readonly schema: Schema.Decoder<A>;
  readonly default: A;
  /** What a value the schema rejects reports; the field then falls back to `default` alone. */
  readonly issue: Issue;
  /** Leave the key out of the file while the value is the default, so older versions stay happy. */
  readonly omitWhenDefault: boolean;
};

export type SettingsFields<F extends object, Issue extends IssueLike> = {
  readonly [K in keyof F]-?: FieldDeclaration<F[K], Issue>;
};

/**
 * `migrations[n]` lifts a file from version `n` to `n + 1`, in memory. A version without an entry
 * needs no change. A step gets the file's object and returns the next one; it must not mutate its
 * input and must return an object, or the file counts as broken (`migration.failed`).
 */
export type Migrations = Readonly<Record<number, (raw: Record<string, unknown>) => unknown>>;

export type DecodedSettings<S, Issue extends IssueLike> = {
  readonly settings: S;
  readonly issues: readonly (Issue | StructuralIssue)[];
  readonly writable: boolean;
};

export type PatchResult<S, Issue extends IssueLike> =
  | { readonly ok: true; readonly settings: S }
  | { readonly ok: false; readonly issues: readonly Issue[] };

const isVersion = Schema.is(Schema.Int.check(Schema.isGreaterThan(0)));

/**
 * Builds decode, encode and patch validation for one declaration at one version. The shell's
 * settings are one instance (`settings.ts`); tests build others, to run migrations at a higher
 * version without touching them.
 */
export const makeSettingsCodec = <
  V extends number,
  F extends object,
  Issue extends IssueLike,
>(spec: {
  readonly version: V;
  readonly fields: SettingsFields<F, Issue>;
  readonly migrations: Migrations;
}) => {
  type Settings = { readonly schemaVersion: V } & F;
  const { version, fields, migrations } = spec;
  const names = Object.keys(fields) as Array<keyof F & string>;
  const declared = names.map((name) => ({
    name,
    field: fields[name],
    read: Schema.decodeUnknownOption(fields[name].schema),
  }));

  const defaults = { schemaVersion: version } as Settings;
  for (const { name, field } of declared) Object.assign(defaults, { [name]: field.default });

  /** Reads the declared fields only: unknown keys are dropped, a bad value falls back alone. */
  const readFields = (raw: Readonly<Record<string, unknown>>, issues: Array<Issue>): Settings => {
    const settings = { ...defaults };
    for (const { name, field, read } of declared) {
      if (!(name in raw)) continue;
      const decoded = read(raw[name]);
      if (Option.isSome(decoded)) Object.assign(settings, { [name]: decoded.value });
      else issues.push(field.issue);
    }
    return settings;
  };

  /** Applies the steps from `from` up to the current version, or names the step that broke. */
  const migrate = (
    raw: Record<string, unknown>,
    from: number,
  ): Result.Result<Record<string, unknown>, StructuralIssue> => {
    let current = raw;
    for (let step = from; step < version; step++) {
      const migration = migrations[step];
      if (migration === undefined) continue;
      const next = Result.try(() => migration(current));
      if (Result.isFailure(next) || !Predicate.isObject(next.success)) {
        return Result.fail({ code: "migration.failed", from: step });
      }
      current = next.success;
    }
    return Result.succeed(current);
  };

  /**
   * Decodes the file's content. Never throws. Older files are migrated in memory first, and the
   * file itself is rewritten only by the next save: an older plugin on another device must not see
   * a file it takes for newer merely because this one loaded it. Invalid fields fall back one by
   * one; a file of a newer version loads defaults and is marked read-only so it is never
   * overwritten; a file a step cannot migrate loads defaults like an unreadable one.
   */
  const decode = (raw: unknown): DecodedSettings<Settings, Issue> => {
    if (raw === undefined || raw === null)
      return { settings: defaults, issues: [], writable: true };
    if (!Predicate.isObject(raw)) {
      return { settings: defaults, issues: [{ code: "file.invalid" }], writable: true };
    }
    const fileVersion = raw["schemaVersion"];
    if (isVersion(fileVersion) && fileVersion > version) {
      return {
        settings: defaults,
        issues: [{ code: "schema.newer", version: fileVersion }],
        writable: false,
      };
    }
    const issues: Array<Issue | StructuralIssue> = [];
    if (fileVersion !== undefined && !isVersion(fileVersion))
      issues.push({ code: "schema.invalid" });
    const migrated = isVersion(fileVersion) ? migrate(raw, fileVersion) : Result.succeed(raw);
    if (Result.isFailure(migrated)) {
      return { settings: defaults, issues: [migrated.failure], writable: true };
    }
    const fieldIssues: Array<Issue> = [];
    const settings = readFields(migrated.success, fieldIssues);
    return { settings, issues: [...issues, ...fieldIssues], writable: true };
  };

  /** What goes into the file: the version and the declared fields, but not defaults that may stay out. */
  const encode = (settings: Settings): Record<string, unknown> => {
    const encoded: Record<string, unknown> = { schemaVersion: settings.schemaVersion };
    for (const { name, field } of declared) {
      const value = settings[name];
      if (!field.omitWhenDefault || !Equal.equals(value, field.default)) encoded[name] = value;
    }
    return encoded;
  };

  /** Applies a patch of fields to the current settings; the result is all-or-nothing. */
  const validatePatch = (current: Settings, patch: Partial<F>): PatchResult<Settings, Issue> => {
    const issues: Array<Issue> = [];
    const settings = readFields({ ...current, ...patch }, issues);
    return issues.length === 0 ? { ok: true, settings } : { ok: false, issues };
  };

  return { defaults, decode, encode, validatePatch };
};
