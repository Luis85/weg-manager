/** One field the user and an outside edit both changed (`NoteEditConflictError`). */
export type FieldConflict = {
  readonly key: string;
  readonly base: unknown;
  readonly edited: unknown;
  readonly current: unknown;
};

/** Which value applies to a conflicting field: the user's input or the note's current value. */
export type ConflictChoices = Readonly<Record<string, "mine" | "theirs">>;
