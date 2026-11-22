import type { Result } from "effect";
import { decodeNote, parseValues, readFields } from "./decode";
import type {
  DecodedNote,
  FieldIssue,
  FieldIssueCode,
  Frontmatter,
  NoteFields,
  NoteInput,
  NoteTypeSpec,
  RecordValues,
} from "./note-type";
import { mergeEdit, newNoteFrontmatter, type MergeFailure, type NotePatch } from "./write";

/**
 * Builds the codec of one note type from its declaration, as `makeSettingsCodec` does for the
 * settings: decode, the new note's frontmatter and the per-field merge all follow from it.
 */
export const defineNoteType = <const F extends NoteFields>(spec: NoteTypeSpec<F>) => ({
  type: spec.type,
  version: spec.version,
  /** Where new notes go below the root folder; `undefined` for the root folder itself. */
  folder: spec.folder,
  fields: spec.fields as F,
  /** The declared keys in declaration order: the order a new note writes them. */
  keys: Object.keys(spec.fields) as Array<keyof F & string>,
  /** Reads a note as a record of this type; never throws. */
  decode: (note: NoteInput): DecodedNote<F> => decodeNote(spec, note),
  /**
   * Checks values a form is about to save against the field rules, as `decode` checks a note's:
   * one issue per required field that is unset (`undefined` or `null`) and per value its schema
   * rejects, in declaration order. Keys the type does not declare are ignored.
   */
  check: (values: Readonly<Record<string, unknown>>): readonly FieldIssue<FieldIssueCode<F>>[] =>
    readFields(spec.fields, values).issues,
  /**
   * A form's values as the type's values once `check` finds nothing, else its issues: what a use
   * case hands to the record kit after its rules passed, without a cast.
   */
  parse: (
    values: Readonly<Record<string, unknown>>,
  ): Result.Result<RecordValues<F>, readonly FieldIssue<FieldIssueCode<F>>[]> =>
    parseValues<F>(spec.fields, values),
  /** The frontmatter of a new note with `id` (from `IdGenerator`) and `values`. */
  newFrontmatter: (id: string, values: RecordValues<F>): Frontmatter =>
    newNoteFrontmatter(spec, id, values),
  /**
   * The per-field merge of a form's save into the note as it is now: a patch, or a conflict or
   * refusal that writes nothing.
   */
  merge: (
    base: Frontmatter,
    edited: RecordValues<F>,
    current: Frontmatter,
  ): Result.Result<NotePatch, MergeFailure> => mergeEdit(spec, base, edited, current),
});

/** The codec of a note type, as `defineNoteType` builds it. */
export type NoteType<F extends NoteFields> = ReturnType<typeof defineNoteType<F>>;
