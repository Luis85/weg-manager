import { Schema } from "effect";
import { NoteNameIssue } from "../../domain/notes";

// No error here carries a path or note content: a describer could not leak what it never gets.

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

/** Every expected failure of the notes module. Each member needs a text in `describeNotesError`. */
export type NotesError =
  | NoteNotFoundError
  | NotePathTakenError
  | InvalidNoteNameError
  | NoteUnreadableError
  | NoteWriteError;

export const NOTES_ERROR_TAGS: ReadonlySet<string> = new Set<NotesError["_tag"]>([
  "NoteNotFoundError",
  "NotePathTakenError",
  "InvalidNoteNameError",
  "NoteUnreadableError",
  "NoteWriteError",
]);
