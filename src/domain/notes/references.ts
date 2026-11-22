import type { DecodedNote, MissingReference, NoteFields } from "./note-type";

/** The ids a reference field's value names: one, several, or none for a value it does not hold. */
const idsOf = (value: unknown): readonly string[] => {
  if (typeof value === "string") return [value];
  return Array.isArray(value) ? (value as readonly string[]) : [];
};

/**
 * One `reference.missing` per id that a reference field of `fields` names in `values` and that is
 * not in `ids`, in field order, then in the order of a list; an id a list names twice once.
 */
const missingReferences = (
  fields: NoteFields,
  values: Readonly<Record<string, unknown>>,
  ids: ReadonlySet<string>,
): MissingReference[] =>
  Object.entries(fields).flatMap(([key, field]) =>
    field.target === undefined
      ? []
      : [...new Set(idsOf(values[key]))]
          .filter((id) => !ids.has(id))
          .map((id) => ({ code: "reference.missing" as const, key, id })),
  );

/**
 * Adds `reference.missing` to every record that names an id no record carries (PBI-61), one issue
 * per missing id and field. The codec reads one note at a time, so this runs over every record the
 * index holds, as `markDuplicateIds` does. Only the record's valid values count, so a malformed
 * reference stays the field's own issue. An id embeds its type and a record's id is of its own type
 * (else it has none), so a target is found by id alone: read-only and duplicated records count. A
 * missing target leaves the note as it was (editable if it was) and its value in place: the target
 * may come back with Sync. A note without a missing target is returned as the same object.
 */
export const markMissingReferences = <N extends DecodedNote<NoteFields>>(
  notes: readonly { readonly fields: NoteFields; readonly note: N }[],
): N[] => {
  const ids = new Set<string>();
  for (const { note } of notes) {
    if (note.kind !== "not-this-type" && note.id !== undefined) ids.add(note.id);
  }
  return notes.map(({ fields, note }) => {
    if (note.kind === "not-this-type") return note;
    const missing = missingReferences(fields, note.values, ids);
    // The kind and the rest stay as they are; only the issues grow.
    return missing.length === 0 ? note : { ...note, issues: [...note.issues, ...missing] };
  });
};
