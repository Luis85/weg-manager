import type { DecodedNote, EditableRecord, NoteFields, ReadOnlyRecord } from "./note-type";

const DUPLICATE = { code: "id.duplicate" } as const;

/** What `markDuplicateIds` makes of a note: an editable one may come back read-only. */
export type MarkedNote<N> = N extends EditableRecord<infer F> ? N | ReadOnlyRecord<F> : N;

/**
 * Marks every note that shares its id with another as read-only with `id.duplicate` (ADR 0007):
 * which one is the record cannot be told, so none may be written. Works over notes of any types;
 * notes without an id and notes of no type are left as they are, as is every note with an id of
 * its own (the same object).
 */
export const markDuplicateIds = <N extends DecodedNote<NoteFields>>(
  notes: readonly N[],
): MarkedNote<N>[] => {
  const counts = new Map<string | undefined, number>();
  for (const note of notes) {
    if (note.kind !== "not-this-type") counts.set(note.id, (counts.get(note.id) ?? 0) + 1);
  }
  return notes.map((note) => {
    if (note.kind === "not-this-type" || note.id === undefined || counts.get(note.id) === 1) {
      return note as MarkedNote<N>;
    }
    const marked = { ...note, kind: "read-only", issues: [...note.issues, DUPLICATE] };
    // TypeScript cannot follow a spread of a generic note into the conditional type.
    return marked as unknown as MarkedNote<N>;
  });
};
