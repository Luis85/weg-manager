import type { DecodedNote, EditableRecord, NoteFields, ReadOnlyRecord } from "./note-type";

/** What `markDuplicateIds` makes of a note: an editable one may come back read-only. */
export type MarkedNote<N> = N extends EditableRecord<infer F> ? N | ReadOnlyRecord<F> : N;

/**
 * Marks every note that shares its id with another as read-only with `id.duplicate` (ADR 0007):
 * which one is the record cannot be told, so none may be written. The issue names the path of the
 * first other note with that id, so the user knows which two to compare. Works over notes of any
 * types; notes without an id and notes of no type are left as they are, as is every note with an
 * id of its own (the same object).
 */
export const markDuplicateIds = <N extends DecodedNote<NoteFields>>(
  notes: readonly N[],
): MarkedNote<N>[] => {
  const paths = new Map<string | undefined, string[]>();
  for (const note of notes) {
    if (note.kind === "not-this-type") continue;
    const known = paths.get(note.id);
    if (known === undefined) paths.set(note.id, [note.path]);
    else known.push(note.path);
  }
  return notes.map((note) => {
    if (note.kind === "not-this-type" || note.id === undefined) return note as MarkedNote<N>;
    const other = paths.get(note.id)?.find((path) => path !== note.path);
    if (other === undefined) return note as MarkedNote<N>;
    const duplicate = { code: "id.duplicate", other } as const;
    const marked = { ...note, kind: "read-only", issues: [...note.issues, duplicate] };
    // TypeScript cannot follow a spread of a generic note into the conditional type.
    return marked as unknown as MarkedNote<N>;
  });
};
