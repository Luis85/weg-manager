/**
 * JSON helpers that reproduce the formatting of the earlier Python writer, so notes and
 * `source_content_sha256` values stay identical for messages imported before the switch.
 */
export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type JsonObject = Record<string, Json>;

export const isObject = (value: unknown): value is JsonObject =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** `json.dumps(value, ensure_ascii=False[, sort_keys=True])` with `", "` and `": "` separators. */
export const pyJson = (value: Json | undefined, sortKeys = false): string => {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return `[${value.map((item) => pyJson(item, sortKeys)).join(", ")}]`;
  if (typeof value === "object") {
    const keys = sortKeys ? Object.keys(value).toSorted() : Object.keys(value);
    const pairs = keys.map((key) => `${JSON.stringify(key)}: ${pyJson(value[key], sortKeys)}`);
    return `{${pairs.join(", ")}}`;
  }
  return JSON.stringify(value);
};

/** A JSON value as plain text: strings unchanged, everything else as JSON. */
export const textOf = (value: Json | undefined): string =>
  typeof value === "string" ? value : pyJson(value);

/** Python's `ensure_ascii=True`: every non-ASCII UTF-16 unit as a `\u` escape. */
export const toAscii = (json: string): string =>
  json.replace(
    /[\u0080-\uffff]/g,
    (char) => `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`,
  );

/** `json.dumps(value, ensure_ascii=True, indent=2)`. */
export const asciiJson = (value: unknown): string => toAscii(JSON.stringify(value, null, 2));

const beforeComment = (value: string): string => value.split(/\s+#/)[0]?.trim() ?? "";

const parseJson = (candidate: string, value: string): { value: Json } | null => {
  const tail = value.slice(candidate.length).trim();
  if (tail && !tail.startsWith("#")) return null;
  try {
    return { value: JSON.parse(candidate) as Json };
  } catch {
    return null;
  }
};

/** Reads one frontmatter value: a JSON value first, then single-quoted or bare YAML text. */
export const scalar = (raw: string): Json => {
  const value = raw.trim();
  const quoted = /^"(?:[^"\\]|\\.)*"/.exec(value)?.[0];
  const json =
    (quoted === undefined ? null : parseJson(quoted, value)) ??
    parseJson(beforeComment(value), value);
  if (json) return json.value;
  const single = /^'((?:[^']|'')*)'(?:\s+#.*)?$/.exec(value);
  return single ? (single[1] ?? "").replaceAll("''", "'") : beforeComment(value);
};
