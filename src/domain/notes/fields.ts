import { Schema } from "effect";

/** A value Obsidian's properties panel can edit: text, number, checkbox, date (as text), list of text. */
export type FieldValue = string | number | boolean | readonly string[];

export type FieldKind = "text" | "number" | "checkbox" | "date" | "list";

/** What a value of the wrong kind reports, unless the declaration names its own code. */
export type KindIssueCode = `field.${FieldKind}`;

/**
 * Everything the codec knows about one frontmatter key: the property kind (which input a form
 * shows), the schema that reads the value as Obsidian's YAML parser hands it over, the issue code
 * a value the schema rejects reports, and whether the key must be there.
 */
export type FieldDeclaration<
  A extends FieldValue = FieldValue,
  Code extends string = string,
  Required extends boolean = boolean,
> = {
  readonly kind: FieldKind;
  readonly schema: Schema.Decoder<A>;
  readonly issue: Code;
  readonly required: Required;
};

/**
 * Declares a field of one kind: optional, reading any value of the kind. A narrower schema (a
 * length, a fixed list of codes) may be given, with the issue code it reports; without one, a bad
 * value reports the kind's code. Overloads, not defaults: an inline `text()` must keep its literal
 * code instead of taking a wider one from the declaration around it.
 */
type FieldKindConstructor<Base extends FieldValue, K extends FieldKind> = {
  (): FieldDeclaration<Base, `field.${K}`, false>;
  <A extends Base>(options: {
    readonly schema: Schema.Decoder<A>;
  }): FieldDeclaration<A, `field.${K}`, false>;
  <A extends Base, const Code extends string>(options: {
    readonly schema: Schema.Decoder<A>;
    readonly issue: Code;
  }): FieldDeclaration<A, Code, false>;
};

/** True for `YYYY-MM-DD` naming a real day: `2026-02-30` is no date, whatever a parser makes of it. */
export const isCalendarDate = (value: string): boolean => {
  const time = Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
};

const fieldKind = <Base extends FieldValue, K extends FieldKind>(
  kind: K,
  base: Schema.Decoder<Base>,
): FieldKindConstructor<Base, K> =>
  ((options: { readonly schema?: Schema.Decoder<Base>; readonly issue?: string } = {}) => ({
    kind,
    schema: options.schema ?? base,
    issue: options.issue ?? `field.${kind}`,
    required: false,
  })) as FieldKindConstructor<Base, K>;

/** A control character, line breaks and tabs included. */
export const isControlCharacter = (character: string): boolean => {
  const code = character.charCodeAt(0);
  return code < 0x20 || code === 0x7f;
};

/**
 * One line of text, not blank, at most `max` characters: a schema for `text` fields such as a
 * name or a label. No control character, so no line break or tab either.
 */
export const lineOfText = (max: number) =>
  Schema.String.check(
    Schema.makeFilter(
      (value: string) =>
        value.trim() !== "" && value.length <= max && ![...value].some(isControlCharacter),
    ),
  );

/** Free text, kept as the user wrote it. */
export const text = fieldKind("text", Schema.String);

/** A finite number. */
export const number = fieldKind("number", Schema.Finite);

/** `true` or `false`. */
export const checkbox = fieldKind("checkbox", Schema.Boolean);

/** A calendar day as `YYYY-MM-DD` text, the form Obsidian's date property writes. */
export const date = fieldKind("date", Schema.String.check(Schema.makeFilter(isCalendarDate)));

/** A list of text. */
export const list = fieldKind("list", Schema.Array(Schema.String));

/** The same field, but a note without a value for it reports `field.missing`. */
export const required = <A extends FieldValue, Code extends string>(
  field: FieldDeclaration<A, Code, false>,
): FieldDeclaration<A, Code, true> => ({ ...field, required: true });
