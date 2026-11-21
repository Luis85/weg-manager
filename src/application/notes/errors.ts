import { Schema } from "effect";
import { NoteNameIssue, WriteRefusal } from "../../domain/notes";

// No error here carries a path, and only `NoteEditConflictError` carries note content: the form
// needs the values to let the user choose. Its describer and its message never use them.

/** No Markdown note lies at the path: it was moved, renamed or deleted meanwhile. */
export class NoteNotFoundError extends Schema.TaggedError<NoteNotFoundError>()(
  "NoteNotFoundError",
  {},
) {}

/** The name is taken in the folder (a rename), or no free name was left (a create). */
export class NotePathTakenError extends Schema.TaggedError<NotePathTakenError>()(
  "NotePathTakenError",
  {},
) {}

/** The name cannot become a file name. */
export class InvalidNoteNameError extends Schema.TaggedError<InvalidNoteNameError>()(
  "InvalidNoteNameError",
  { issue: NoteNameIssue },
) {}

/** The note's frontmatter is not valid YAML, so it cannot be changed without damage. */
export class NoteUnreadableError extends Schema.TaggedError<NoteUnreadableError>()(
  "NoteUnreadableError",
  { cause: Schema.Defect() },
) {}

/** Obsidian rejected the write: the disk, the file system or a concurrent change. */
export class NoteWriteError extends Schema.TaggedError<NoteWriteError>()("NoteWriteError", {
  cause: Schema.Defect(),
}) {}

/** One field both the user and an outside edit changed: loaded, saved and current value. */
const FieldConflict = Schema.Struct({
  key: Schema.String,
  base: Schema.Unknown,
  edited: Schema.Unknown,
  current: Schema.Unknown,
});

/**
 * The note was changed outside the form in fields the user changed too, to other values (ADR
 * 0007). Nothing was written; the form shows each field's values for the user to choose.
 */
export class NoteEditConflictError extends Schema.TaggedError<NoteEditConflictError>()(
  "NoteEditConflictError",
  { conflicts: Schema.Array(FieldConflict) },
) {}

/** The note is no longer the record the form loaded, so nothing was written. */
export class NoteWriteRefusedError extends Schema.TaggedError<NoteWriteRefusedError>()(
  "NoteWriteRefusedError",
  { reason: WriteRefusal },
) {}

/**
 * The note index could not read the vault (its `list`) or a note it follows (a `read`). The
 * index keeps the notes it read last and shows this beside them, until a rebuild succeeds.
 */
export class NoteIndexReadError extends Schema.TaggedError<NoteIndexReadError>()(
  "NoteIndexReadError",
  {},
) {}

/** Every expected failure of the notes module. Each member needs a text in `describeNotesError`. */
export type NotesError =
  | NoteNotFoundError
  | NotePathTakenError
  | InvalidNoteNameError
  | NoteUnreadableError
  | NoteWriteError
  | NoteEditConflictError
  | NoteWriteRefusedError
  | NoteIndexReadError;

export const NOTES_ERROR_TAGS: ReadonlySet<string> = new Set<NotesError["_tag"]>([
  "NoteNotFoundError",
  "NotePathTakenError",
  "InvalidNoteNameError",
  "NoteUnreadableError",
  "NoteWriteError",
  "NoteEditConflictError",
  "NoteWriteRefusedError",
  "NoteIndexReadError",
]);
