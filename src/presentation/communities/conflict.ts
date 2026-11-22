/** One field the user and an outside edit both changed (`NoteEditConflictError`). */
export type { FieldConflict } from "../../domain/notes";

/** Which value applies to a conflicting field: the user's input or the note's current value. */
export type ConflictChoices = Readonly<Record<string, "mine" | "theirs">>;
