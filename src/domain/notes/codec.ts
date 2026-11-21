import type { Result } from "effect";
import { decodeNote } from "./decode";
import type {
  DecodedNote,
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
  fields: spec.fields as F,
  /** The declared keys in declaration order: the order a new note writes them. */
  keys: Object.keys(spec.fields) as Array<keyof F & string>,
  /** Reads a note as a record of this type; never throws. */
  decode: (note: NoteInput): DecodedNote<F> => decodeNote(spec, note),
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
