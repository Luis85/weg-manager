import { Schema } from "effect";
import { parseRecordId } from "./record-id";

/** A value Obsidian's properties panel can edit: text, number, checkbox, date (as text), list of text. */
export type FieldValue = string | number | boolean | readonly string[];

/**
 * What a form shows for a value. `reference` and `references` hold record ids (one as text, several
 * as a list of text): Obsidian edits them as text and list, the plugin as a choice of records.
 */
export type FieldKind =
  "text" | "number" | "checkbox" | "date" | "list" | "reference" | "references";

/** What a value of the wrong kind reports, unless the declaration names its own code. */
export type KindIssueCode = `field.${FieldKind}`;

/**
 * Everything the codec knows about one frontmatter key: the property kind (which input a form
 * shows), the schema that reads the value as Obsidian's YAML parser hands it over, the issue code
 * a value the schema rejects reports, whether the key must be there, and, for a reference, the
 * note type it refers to.
 */
export type FieldDeclaration<
  A extends FieldValue = FieldValue,
  Code extends string = string,
  Required extends boolean = boolean,
  Target extends string | undefined = string | undefined,
> = {
  readonly kind: FieldKind;
  readonly schema: Schema.Decoder<A>;
  readonly issue: Code;
  readonly required: Required;
  /** The type whose record a reference names by its `id`; `undefined` for every other kind. */
  readonly target: Target;
};

/**
 * Declares a field of one kind: optional, reading any value of the kind. A narrower schema (a
 * length, a fixed list of codes) may be given, with the issue code it reports; without one, a bad
 * value reports the kind's code. Overloads, not defaults: an inline `text()` must keep its literal
 * code instead of taking a wider one from the declaration around it.
 */
type FieldKindConstructor<Base extends FieldValue, K extends FieldKind> = {
  (): FieldDeclaration<Base, `field.${K}`, false, undefined>;
  <A extends Base>(options: {
    readonly schema: Schema.Decoder<A>;
  }): FieldDeclaration<A, `field.${K}`, false, undefined>;
  <A extends Base, const Code extends string>(options: {
    readonly schema: Schema.Decoder<A>;
    readonly issue: Code;
  }): FieldDeclaration<A, Code, false, undefined>;
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
    target: undefined,
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

/** The id of a record of `target`: `<target>-<uuid>`, the UUID in lower case (ADR 0007). */
const idOf = (target: string) =>
  Schema.String.check(Schema.makeFilter((value: string) => parseRecordId(value)?.type === target));

/**
 * A reference to one record of `target` by its `id` (`community_id: community-…`). A value that is
 * no id of that type reports `field.reference`. Whether a record has the id is not the codec's
 * question, because it reads one note: the note index adds `reference.missing`
 * (`markMissingReferences`).
 */
export const reference = <const Target extends string>(
  target: Target,
): FieldDeclaration<string, "field.reference", false, Target> => ({
  kind: "reference",
  schema: idOf(target),
  issue: "field.reference",
  required: false,
  target,
});

/**
 * References to several records of `target`, as a list of ids (`community_ids`): empty for none,
 * an id twice kept as written. One entry that is no id of that type makes the whole value
 * `field.references`, as one entry that is no text makes a list `field.list`.
 */
export const references = <const Target extends string>(
  target: Target,
): FieldDeclaration<readonly string[], "field.references", false, Target> => ({
  kind: "references",
  schema: Schema.Array(idOf(target)),
  issue: "field.references",
  required: false,
  target,
});

/** The same field, but a note without a value for it reports `field.missing`. */
export const required = <
  A extends FieldValue,
  Code extends string,
  Target extends string | undefined,
>(
  field: FieldDeclaration<A, Code, false, Target>,
): FieldDeclaration<A, Code, true, Target> => ({ ...field, required: true });
