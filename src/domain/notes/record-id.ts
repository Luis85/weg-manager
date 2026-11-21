import { TYPE_NAME } from "./schema-marker";

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

const RECORD_ID = new RegExp(`^(${TYPE_NAME})-(${UUID})$`);

/** Why a note's `id` gives it no identity of its type. */
export type IdIssue =
  | { readonly code: "id.missing" }
  | { readonly code: "id.malformed" }
  | { readonly code: "id.other-type" };

/** A record's identity, `<type>-<uuid>` (ADR 0007): created once, never changed. */
export const recordId = (type: string, uuid: string): string => `${type}-${uuid}`;

/**
 * The type and the lower-case UUID of an id, or `undefined` when the value is no id. The UUID's
 * version is not checked: people and agents may create ids with other tools.
 */
export const parseRecordId = (
  value: unknown,
): { readonly type: string; readonly uuid: string } | undefined => {
  const match = typeof value === "string" ? RECORD_ID.exec(value) : null;
  return match === null ? undefined : { type: match[1] as string, uuid: match[2] as string };
};

/** What is wrong with `value` as the `id` of a note of `type`, or `undefined` when it is fine. */
export const recordIdIssue = (type: string, value: unknown): IdIssue | undefined => {
  if (value === undefined || value === null) return { code: "id.missing" };
  const parsed = parseRecordId(value);
  if (parsed === undefined) return { code: "id.malformed" };
  return parsed.type === type ? undefined : { code: "id.other-type" };
};
