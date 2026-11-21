import { Option, Result, Schema } from "effect";
import { runMigrations } from "../shell";
import type {
  DecodedNote,
  FieldIssue,
  FieldIssueCode,
  Frontmatter,
  NoteFields,
  NoteInput,
  NoteTypeSpec,
  PartialValues,
} from "./note-type";
import { recordIdIssue } from "./record-id";
import { parseSchemaMarker, schemaMarker } from "./schema-marker";

/** A value that counts as not set: no key, or a key without value (how Obsidian empties a property). */
const isUnset = (value: unknown): value is null | undefined =>
  value === undefined || value === null;

/** The declared fields of `frontmatter`: each valid one by its key, each broken one as an issue. */
export const readFields = <F extends NoteFields>(
  fields: F,
  frontmatter: Frontmatter,
): {
  readonly values: PartialValues<F>;
  readonly issues: FieldIssue<FieldIssueCode<F>>[];
} => {
  const values: Record<string, unknown> = {};
  const issues: FieldIssue<FieldIssueCode<F>>[] = [];
  for (const [key, field] of Object.entries(fields)) {
    const raw = frontmatter[key];
    if (isUnset(raw)) {
      if (field.required) issues.push({ code: "field.missing", key });
      continue;
    }
    const decoded = Schema.decodeUnknownOption(field.schema)(raw);
    if (Option.isSome(decoded)) values[key] = decoded.value;
    else issues.push({ code: field.issue, key });
  }
  return { values: values as PartialValues<F>, issues };
};

/**
 * Lifts `frontmatter` from version `from` to the declaration's through the table, in memory, and
 * sets `schema` to the current version. A step that throws or returns no object names its version.
 */
export const migrate = (
  spec: NoteTypeSpec<NoteFields>,
  frontmatter: Frontmatter,
  from: number,
): Result.Result<Frontmatter, { readonly code: "migration.failed"; readonly from: number }> => {
  const lifted = runMigrations(spec.migrations, frontmatter, from, spec.version);
  return Result.isFailure(lifted)
    ? Result.fail({ code: "migration.failed", from: lifted.failure })
    : Result.succeed({ ...lifted.success, schema: schemaMarker(spec.type, spec.version) });
};

/**
 * Reads a note as a record of this type. Never throws. Nothing is written back: an older note is
 * migrated in memory and keeps its version on disk until the user saves it (ADR 0007).
 */
export const decodeNote = <F extends NoteFields>(
  spec: NoteTypeSpec<F>,
  note: NoteInput,
): DecodedNote<F> => {
  const { path, frontmatter } = note;
  const marker = parseSchemaMarker(frontmatter["schema"]);
  if (marker.kind !== "record" || marker.type !== spec.type) {
    return { kind: "not-this-type", path, frontmatter, marker };
  }
  const idIssue = recordIdIssue(spec.type, frontmatter["id"]);
  const id = idIssue === undefined ? (frontmatter["id"] as string) : undefined;
  const located = { path, frontmatter, version: marker.version };
  if (marker.version > spec.version) {
    const issues = [{ code: "schema.newer", version: marker.version } as const];
    return { ...located, kind: "read-only", id, values: {}, issues };
  }
  const migrated = migrate(spec, frontmatter, marker.version);
  if (Result.isFailure(migrated)) {
    return { ...located, kind: "read-only", id, values: {}, issues: [migrated.failure] };
  }
  const { values, issues } = readFields(spec.fields, migrated.success);
  return idIssue === undefined
    ? { ...located, kind: "editable", id: id as string, values, issues }
    : { ...located, kind: "read-only", id, values, issues: [idIssue, ...issues] };
};
