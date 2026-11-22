import { Equal } from "effect";
import type { NoteType } from "./codec";
import type { FieldKind, FieldValue } from "./fields";
import type { FieldValueOf, Frontmatter, NoteFields } from "./note-type";

/**
 * What a form holds for a value of type `A`, by its kind (PBI-71): text for text, dates and a
 * reference; a number or nothing for a number; a flag for a checkbox; a list of text for a list
 * and for references.
 */
export type InputValue<A> = [A] extends [boolean]
  ? boolean
  : [A] extends [number]
    ? number | undefined
    : [A] extends [readonly string[]]
      ? readonly string[]
      : string;

/** What a record's form holds: each field's value in the form of its kind. */
export type FormInput<F extends NoteFields> = {
  readonly [K in keyof F & string]: InputValue<FieldValueOf<F[K]>>;
};

/**
 * What a form saves of each field before the rules run: its value in the form of its kind, or
 * `undefined` when blank.
 */
export type FormDraft<F extends NoteFields> = {
  readonly [K in keyof F & string]: Exclude<InputValue<FieldValueOf<F[K]>>, undefined> | undefined;
};

/** A form value of any kind. */
export type FormValue = string | number | boolean | readonly string[] | undefined;

/** A single value as text: what a text input shows of it. Nothing else has a text. */
const asText = (value: unknown): string | undefined =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : undefined;

const blankAsUnset = (value: string): string | undefined => {
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
};

/** How one kind of field maps between the stored value and the form's value. */
type KindForm = {
  readonly toInput: (raw: unknown) => FormValue;
  readonly fromInput: (input: FormValue) => FieldValue | undefined;
};

const textForm: KindForm = {
  toInput: (raw) => asText(raw) ?? "",
  fromInput: (input) => (typeof input === "string" ? blankAsUnset(input) : undefined),
};

const listForm: KindForm = {
  toInput: (raw) => {
    if (typeof raw === "string") return [raw];
    return Array.isArray(raw) ? raw.flatMap((entry) => asText(entry) ?? []) : [];
  },
  fromInput: (input) => {
    if (!Array.isArray(input)) return undefined;
    const entries = input.flatMap((entry: string) => blankAsUnset(entry) ?? []);
    return entries.length === 0 ? undefined : entries;
  },
};

/** The mapping of each field kind (PBI-71). */
const KIND_FORMS: { readonly [K in FieldKind]: KindForm } = {
  text: textForm,
  date: textForm,
  reference: textForm,
  number: {
    toInput: (raw) => (typeof raw === "number" ? raw : undefined),
    fromInput: (input) => (typeof input === "number" ? input : undefined),
  },
  checkbox: {
    toInput: (raw) => raw === true,
    fromInput: (input) => (typeof input === "boolean" ? input : undefined),
  },
  list: listForm,
  references: listForm,
};

/**
 * A stored value as the form of its kind holds it. A value of another kind is shown where the
 * kind can hold it (a number in a text field, one text as a list of one), so a save repairs it;
 * anything else, and an unset or empty property, is the kind's empty value.
 */
export const toInput = (kind: FieldKind, raw: unknown): FormValue => KIND_FORMS[kind].toInput(raw);

/**
 * What a form saves of a form value of `kind`: text trimmed, list entries trimmed and blank ones
 * dropped; blank text and an empty list are unset; numbers and flags as they are.
 */
export const fromInput = (kind: FieldKind, input: FormValue): FieldValue | undefined =>
  KIND_FORMS[kind].fromInput(input);

/** The kind of the declared field `key`. */
const kindOf = <F extends NoteFields>(type: NoteType<F>, key: keyof F & string): FieldKind =>
  // Declared, as `key` is one of the type's keys.
  type.fields[key]?.kind ?? "text";

/** Every declared field of `type`, in declaration order, mapped by `value`. */
const byField = <F extends NoteFields, R>(
  type: NoteType<F>,
  value: (key: keyof F & string) => unknown,
): R => Object.fromEntries(type.keys.map((key) => [key, value(key)])) as R;

/** The form's input for a note's frontmatter: each field through its kind's `toInput`. */
export const formInput = <F extends NoteFields>(
  type: NoteType<F>,
  frontmatter: Frontmatter,
): FormInput<F> => byField(type, (key) => toInput(kindOf(type, key), frontmatter[key]));

/** What a form saves of its input: each field through its kind's `fromInput`. */
export const draftValues = <F extends NoteFields>(
  type: NoteType<F>,
  input: FormInput<F>,
): FormDraft<F> => byField(type, (key) => fromInput(kindOf(type, key), input[key]));

/** Each field of a form's input trimmed, a blank one unset: what a form saves of plain text. */
export const trimmedValues = <I extends Readonly<Record<string, string>>>(
  input: I,
): { readonly [K in keyof I]: string | undefined } =>
  Object.fromEntries(Object.entries(input).map(([key, value]) => [key, blankAsUnset(value)])) as {
    readonly [K in keyof I]: string | undefined;
  };

/**
 * The values an edit saves (DV-01: only the fields the person changed are written). A field whose
 * input is still what the form loaded (compared in the form of its kind, structurally) keeps the
 * note's value as written, surrounding spaces, a list's order and an id to a missing record
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
  const untouched = (key: keyof F & string): boolean =>
    !broken.has(key) && Equal.equals(input[key], toInput(kindOf(type, key), loaded[key]));
  return byField(type, (key) => (untouched(key) ? (loaded[key] ?? undefined) : draft[key]));
};
