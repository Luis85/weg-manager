/** Every record's `schema` starts with this: `weg-manager.<type>/v<n>` (ADR 0007). */
export const RECORD_SCHEMA_PREFIX = "weg-manager.";

/** A note type's name: an English singular in kebab-case, letters only (`community`, `unit-label`). */
export const TYPE_NAME = "[a-z]+(?:-[a-z]+)*";

const MARKER = new RegExp(`^weg-manager\\.(${TYPE_NAME})/v([1-9]\\d*)$`);

/**
 * What a note's `schema` says: no record at all (no string with the prefix), a record whose marker
 * is broken, or a record of a type at a version.
 */
export type SchemaMarker =
  | { readonly kind: "none" }
  | { readonly kind: "malformed" }
  | { readonly kind: "record"; readonly type: string; readonly version: number };

/**
 * Reads a `schema` value. Never throws: a value with the prefix but not of the form
 * `weg-manager.<type>/v<n>` (`n` a positive integer without leading zero) is `malformed`, so the
 * note is shown with an issue instead of being taken for someone else's.
 */
export const parseSchemaMarker = (value: unknown): SchemaMarker => {
  if (typeof value !== "string" || !value.startsWith(RECORD_SCHEMA_PREFIX)) return { kind: "none" };
  const match = MARKER.exec(value);
  const version = Number(match?.[2]);
  return match !== null && Number.isSafeInteger(version)
    ? { kind: "record", type: match[1] as string, version }
    : { kind: "malformed" };
};

/** The `schema` value of a record of `type` at `version`. */
export const schemaMarker = (type: string, version: number): string =>
  `${RECORD_SCHEMA_PREFIX}${type}/v${version}`;
