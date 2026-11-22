import type { NoteType } from "./codec";
import type { Frontmatter, NoteFields } from "./note-type";

/** What a record's form holds: the text of each field as typed. */
export type FormInput<F extends NoteFields> = { readonly [K in keyof F & string]: string };

/** What a form saves of each field before the rules run: its text, or `undefined` when blank. */
export type FormDraft<F extends NoteFields> = {
  readonly [K in keyof F & string]: string | undefined;
};

const blankAsUnset = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

/** Each field of a form's input trimmed, a blank one unset: what a form saves of plain text. */
export const trimmedValues = <I extends Readonly<Record<string, string>>>(
  input: I,
): { readonly [K in keyof I]: string | undefined } =>
  Object.fromEntries(Object.entries(input).map(([key, value]) => [key, blankAsUnset(value)])) as {
    readonly [K in keyof I]: string | undefined;
  };

/**
 * The values an edit saves (DV-01: only the fields the person changed are written). A field whose
 * input is still the text the form loaded keeps the note's value as written, surrounding spaces
 * included, while that value is valid; every other field is the form's `draft`, so a broken value
 * the form shows is repaired by a save. Every declared field, in declaration order.
 */
export const editedValues = <F extends NoteFields>(
  type: NoteType<F>,
  input: FormInput<F>,
  draft: FormDraft<F>,
  loaded: Frontmatter,
): FormDraft<F> => {
  const broken = new Set(type.check(loaded).map((issue) => issue.key));
  const kept = (key: keyof F & string): string | undefined => {
    const value = loaded[key];
    // Equal to the input's text, so a string.
    return value === input[key] && !broken.has(key) ? (value as string) : draft[key];
  };
  return Object.fromEntries(type.keys.map((key) => [key, kept(key)])) as FormDraft<F>;
};
