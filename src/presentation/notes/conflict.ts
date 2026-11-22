import { shownReference, type ReferenceNames } from "../../application/notes";
import type { NotesCatalog } from "../../application/notes";
import type { FieldKind } from "../../domain/notes";

/** Which value applies to a conflicting field: the user's input or the note's current value. */
export type ConflictChoices = Readonly<Record<string, "mine" | "theirs">>;

/** One value as text: a single text, number or flag; nothing else. */
const single = (value: unknown): string | undefined =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : undefined;

/**
 * A field's value as the conflict choice shows it (PBI-71), by the field's kind: a flag as yes or
 * no, a list's entries joined, a referenced record by its shown name (the id while none carries
 * it), unset and an empty list as "empty". A value of another kind (an outside edit) is shown as
 * it is, so the user sees what the note holds.
 */
export const shownValue = (
  kind: FieldKind,
  value: unknown,
  texts: NotesCatalog["conflict"],
  names: ReferenceNames = () => undefined,
): string => {
  const entry = (item: unknown): string | undefined => {
    const text = single(item);
    return text !== undefined && (kind === "reference" || kind === "references")
      ? shownReference(names, text)
      : text;
  };
  if (kind === "checkbox" && typeof value === "boolean") {
    return value ? texts.checked : texts.unchecked;
  }
  if (Array.isArray(value)) {
    const entries = value.flatMap((item: unknown) => entry(item) ?? []);
    return entries.length === 0 ? texts.empty : entries.join(", ");
  }
  return entry(value) ?? texts.empty;
};
