import { Equal, Result, Schema } from "effect";
import { migrate, readFields } from "./decode";
import type { Frontmatter, NoteFields, NoteTypeSpec } from "./note-type";
import { recordIdIssue } from "./record-id";
import { parseSchemaMarker, schemaMarker } from "./schema-marker";

/**
 * What a save writes: keys to set (in their place, or appended) and keys to remove. The same shape
 * as the `NoteStore`'s `FrontmatterPatch`, so the merge plugs into `update`.
 */
export type NotePatch = { readonly set: Frontmatter; readonly remove: readonly string[] };

/**
 * A field both the user and an outside edit changed, to different values: the value the form
 * loaded, the user's and the note's now, each in the current version's form (`undefined` = unset).
 */
export type FieldConflict = {
  readonly key: string;
  readonly base: unknown;
  readonly edited: unknown;
  readonly current: unknown;
};

/** Why a note may not be written at all: it is no longer the record the form loaded. */
export const WriteRefusal = Schema.Literals([
  "other-type",
  "newer-version",
  "identity",
  "migration-failed",
]);
export type WriteRefusal = typeof WriteRefusal.Type;

export type MergeFailure =
  | { readonly _tag: "conflict"; readonly conflicts: readonly FieldConflict[] }
  | { readonly _tag: "refused"; readonly reason: WriteRefusal };

/** Structural equality where an empty property (`null`, as Obsidian writes it) is an unset one. */
const same = (a: unknown, b: unknown): boolean => Equal.equals(a ?? undefined, b ?? undefined);

/**
 * The frontmatter of a new note: `schema`, then `id`, then every set field in declaration order.
 * Keys the type does not declare are left out.
 */
export const newNoteFrontmatter = (
  spec: NoteTypeSpec<NoteFields>,
  id: string,
  values: Readonly<Record<string, unknown>>,
): Frontmatter => {
  const frontmatter: Record<string, unknown> = {
    schema: schemaMarker(spec.type, spec.version),
    id,
  };
  for (const key of Object.keys(spec.fields)) {
    const value = values[key];
    if (value !== undefined) frontmatter[key] = structuredClone(value);
  }
  return frontmatter;
};

/** The frontmatter lifted to the current version, or why it may not be written. */
const writable = (
  spec: NoteTypeSpec<NoteFields>,
  frontmatter: Frontmatter,
): Result.Result<Frontmatter, WriteRefusal> => {
  const marker = parseSchemaMarker(frontmatter["schema"]);
  if (marker.kind !== "record" || marker.type !== spec.type) return Result.fail("other-type");
  if (marker.version > spec.version) return Result.fail("newer-version");
  if (recordIdIssue(spec.type, frontmatter["id"]) !== undefined) return Result.fail("identity");
  return Result.mapError(migrate(spec, frontmatter, marker.version), () => "migration-failed");
};

/** Both sides lifted to the current version, if both are still the same record of this type. */
const liftBoth = (
  spec: NoteTypeSpec<NoteFields>,
  base: Frontmatter,
  current: Frontmatter,
): Result.Result<readonly [Frontmatter, Frontmatter], WriteRefusal> => {
  const liftedBase = writable(spec, base);
  if (Result.isFailure(liftedBase)) return Result.fail(liftedBase.failure);
  const liftedCurrent = writable(spec, current);
  if (Result.isFailure(liftedCurrent)) return Result.fail(liftedCurrent.failure);
  return current["id"] === base["id"]
    ? Result.succeed([liftedBase.success, liftedCurrent.success])
    : Result.fail("identity");
};

/** What lifting `current` changed: each changed or new key, and each dropped key (`undefined`). */
const migrationWrites = (current: Frontmatter, lifted: Frontmatter): Map<string, unknown> => {
  const writes = new Map<string, unknown>();
  for (const [key, value] of Object.entries(lifted)) {
    if (!Equal.equals(current[key], value)) writes.set(key, value);
  }
  for (const key of Object.keys(current)) {
    if (!Object.hasOwn(lifted, key)) writes.set(key, undefined);
  }
  return writes;
};

const toPatch = (writes: ReadonlyMap<string, unknown>): NotePatch => {
  const set: Record<string, unknown> = {};
  const remove: string[] = [];
  for (const [key, value] of writes) {
    if (value === undefined) remove.push(key);
    else set[key] = structuredClone(value);
  }
  return { set, remove };
};

/**
 * The per-field merge of ADR 0007, decided inside the atomic write. `base` is the frontmatter the
 * form loaded, `edited` every field as the user saved it (`undefined` = cleared), `current` the
 * note's frontmatter now. A field the user did not change keeps the note's value; a field the
 * user changed is written while the note still has the loaded value; a field both changed to
 * different values is a conflict, and then nothing is written. Only declared keys are written,
 * except that a note of an older version is written in the current one: its `schema` and whatever
 * the migration changed go into the same patch. Values compare structurally.
 */
export const mergeEdit = (
  spec: NoteTypeSpec<NoteFields>,
  base: Frontmatter,
  edited: Readonly<Record<string, unknown>>,
  current: Frontmatter,
): Result.Result<NotePatch, MergeFailure> => {
  const lifted = liftBoth(spec, base, current);
  if (Result.isFailure(lifted)) return Result.fail({ _tag: "refused", reason: lifted.failure });
  const [liftedBase, liftedCurrent] = lifted.success;
  const loaded: Readonly<Record<string, unknown>> = readFields(spec.fields, liftedBase).values;
  const writes = migrationWrites(current, liftedCurrent);
  const conflicts: FieldConflict[] = [];
  for (const key of Object.keys(spec.fields)) {
    const mine = edited[key];
    const was = liftedBase[key];
    const now = liftedCurrent[key];
    if (same(mine, loaded[key])) continue;
    if (same(now, was)) writes.set(key, mine);
    else if (!same(now, mine)) conflicts.push({ key, base: was, edited: mine, current: now });
  }
  return conflicts.length > 0
    ? Result.fail({ _tag: "conflict", conflicts })
    : Result.succeed(toPatch(writes));
};
