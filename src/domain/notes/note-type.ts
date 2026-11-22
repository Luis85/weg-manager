import type { Migrations } from "../shell";
import type { FieldDeclaration, KindIssueCode } from "./fields";
import type { IdIssue } from "./record-id";
import type { SchemaMarker } from "./schema-marker";

/** A note's frontmatter as plain data: what Obsidian's YAML parser makes of it. */
export type Frontmatter = Readonly<Record<string, unknown>>;

/**
 * What a write changes: keys to set (in their place, or appended in this order) and keys to remove
 * unless `set` has them too. Every other key, known or not, stays as it is, in its order. The
 * merge, the line edit and `NoteStore.update` share this one shape.
 */
export type FrontmatterPatch = {
  readonly set?: Frontmatter;
  readonly remove?: readonly string[];
};

/**
 * The fields of one note type, by their frontmatter key: English snake_case (ADR 0007). The record
 * uses the same keys, so the file, its contract page and the code share one name per field.
 */
export type NoteFields = Readonly<Record<string, FieldDeclaration>>;

/**
 * `migrations[n]` lifts frontmatter from version `n` to `n + 1`, in memory, without mutating it;
 * the same table as the settings' (`runMigrations`).
 */
export type { Migrations };

/** One declaration per note type; it drives decode, the new note's frontmatter and the merge. */
export type NoteTypeSpec<F extends NoteFields> = {
  /** English singular in kebab-case: the `<type>` of `schema` and of every `id`. */
  readonly type: string;
  /** The version this plugin writes: a positive integer. */
  readonly version: number;
  /**
   * The folder below the root folder where new notes of this type go (`Gemeinschaften`); none puts
   * them into the root folder. Part of the file contract, so German in every UI language (ADR 0007).
   */
  readonly folder?: string;
  /** In the order a new note writes them; `schema` and `id` are not fields. */
  readonly fields: F & { readonly schema?: never; readonly id?: never };
  readonly migrations: Migrations;
};

/** The value type a field declaration reads. */
export type FieldValueOf<D> = D extends FieldDeclaration<infer A> ? A : never;

type RequiredKey<F extends NoteFields> = {
  [K in keyof F]: F[K]["required"] extends true ? K : never;
}[keyof F];

/** A record's values as a form saves them: every required field, the others when set. */
export type RecordValues<F extends NoteFields> = {
  readonly [K in RequiredKey<F>]: FieldValueOf<F[K]>;
} & {
  readonly [K in Exclude<keyof F, RequiredKey<F>>]?: FieldValueOf<F[K]> | undefined;
};

/** The values a note holds: the fields that are set and valid. */
export type PartialValues<F extends NoteFields> = {
  readonly [K in keyof F]?: FieldValueOf<F[K]>;
};

/** The issue codes the fields of `F` report for a bad value. */
export type FieldIssueCode<F extends NoteFields> = F[keyof F]["issue"];

/** A field whose value is missing (`field.missing`) or rejected (its declared code), by key. */
export type FieldIssue<Code extends string = KindIssueCode> = {
  readonly code: "field.missing" | Code;
  readonly key: string;
};

/**
 * A well-formed reference whose target no record has (no note of the target type carries the id,
 * PBI-61): one per missing id and field. The note index adds it (`markMissingReferences`); it
 * never makes a note read-only, and the value stays among the note's values. `id` is shown to the
 * user, the only name left of a record that is gone; logs never carry it.
 */
export type MissingReference = {
  readonly code: "reference.missing";
  readonly key: string;
  readonly id: string;
};

/** The keys of the reference fields of `F`. */
type ReferenceKey<F extends NoteFields> = {
  [K in keyof F]: F[K]["target"] extends string ? K : never;
}[keyof F];

/** `MissingReference` for a type with a reference field, `never` for one without. */
export type ReferenceIssue<F extends NoteFields> = [ReferenceKey<F>] extends [never]
  ? never
  : MissingReference;

/** Every issue a record of `F` has at one of its fields. */
export type RecordFieldIssue<F extends NoteFields> =
  FieldIssue<FieldIssueCode<F>> | ReferenceIssue<F>;

/** Issues of the note as a whole: its marker, its version, its identity. Each makes it read-only. */
export type RecordIssue =
  | { readonly code: "schema.malformed" }
  | { readonly code: "schema.newer"; readonly version: number }
  | { readonly code: "migration.failed"; readonly from: number }
  | IdIssue
  /** `other` is the path of another note with the same id; the UI shows it, logs never do. */
  | { readonly code: "id.duplicate"; readonly other: string };

/**
 * Why a note that must be shown belongs to no note type the plugin knows (ADR 0007): its `schema`
 * has the prefix but cannot be read, it names a type no feature declares (`type` as written), or
 * it lies in the plugin's folders and its frontmatter block cannot be parsed at all.
 */
export type UnindexedIssue =
  | { readonly code: "schema.malformed" }
  | { readonly code: "schema.unknown-type"; readonly type: string }
  | { readonly code: "frontmatter.unreadable" };

/** Every issue the codec reports. Language-free codes with data (ADR 0005). */
export type NoteIssue<Code extends string = KindIssueCode> = RecordIssue | FieldIssue<Code>;

type Located = { readonly path: string; readonly frontmatter: Frontmatter };

/** No record of this type: no `schema`, another type, or a marker that cannot be read. */
export type NotThisType = Located & {
  readonly kind: "not-this-type";
  readonly marker: SchemaMarker;
};

type RecordNote<F extends NoteFields> = Located & {
  /** The note's version as on disk; below the declaration's, it was migrated in memory. */
  readonly version: number;
  readonly values: PartialValues<F>;
};

/**
 * A record that must not be written: newer, unmigratable (no values then), without a valid id of
 * its type, or sharing its id. It is still shown, with its issues.
 */
export type ReadOnlyRecord<F extends NoteFields> = RecordNote<F> & {
  readonly kind: "read-only";
  readonly id: string | undefined;
  readonly issues: readonly (NoteIssue<FieldIssueCode<F>> | ReferenceIssue<F>)[];
};

/**
 * A record the user may change, also with broken fields: `issues` names each by key, so the form
 * marks it and shows the raw value from `frontmatter`, and saving repairs it.
 */
export type EditableRecord<F extends NoteFields> = RecordNote<F> & {
  readonly kind: "editable";
  readonly id: string;
  readonly issues: readonly RecordFieldIssue<F>[];
};

export type DecodedNote<F extends NoteFields> = NotThisType | ReadOnlyRecord<F> | EditableRecord<F>;

/** What decode reads: a note as the `NoteStore` hands it out. */
export type NoteInput = { readonly path: string; readonly frontmatter: Frontmatter };
