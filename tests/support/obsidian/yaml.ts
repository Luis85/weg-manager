/**
 * Obsidian's `parseYaml` and `stringifyYaml` for the frontmatter this plugin writes: a flat map of
 * text, numbers, booleans, null and lists of those (ADR 0007). Obsidian 1.15 parses YAML 1.2 with
 * the core schema (`012` is 12, `2026-01-01` stays text) and writes block lists with two spaces,
 * null as an empty value and `[]` for an empty list; this copy does the same for that subset.
 *
 * It is stricter than Obsidian, never more forgiving: a nested map, a block scalar, an anchor, a
 * tag or a quoted item in a `[…]` list is a `YAMLParseError` here, and `stringifyYaml` throws for
 * values a record never holds. It double-quotes some strings Obsidian writes plain (`-dash`, `?x`);
 * the values read back the same.
 */

/** The error Obsidian's parser throws (its `name` is all a caller can rely on). */
export class YAMLParseError extends Error {
  override readonly name = "YAMLParseError";
}

const fail = (message: string): never => {
  throw new YAMLParseError(message);
};

/** Plain scalars of the YAML 1.2 core schema, first match wins; anything else is text. */
const PLAIN: readonly (readonly [RegExp, (text: string) => unknown])[] = [
  [/^(?:null|Null|NULL|~|)$/, () => null],
  [/^(?:true|True|TRUE)$/, () => true],
  [/^(?:false|False|FALSE)$/, () => false],
  [/^[-+]?(?:\.\d+|\d+(?:\.\d*)?)(?:[eE][-+]?\d+)?$/, Number],
  [/^0x[\dA-Fa-f]+$/, (text) => Number.parseInt(text.slice(2), 16)],
  [/^0o[0-7]+$/, (text) => Number.parseInt(text.slice(2), 8)],
  [/^[-+]?\.(?:inf|Inf|INF)$/, (text) => (text.startsWith("-") ? -Infinity : Infinity)],
  [/^\.(?:nan|NaN|NAN)$/, () => Number.NaN],
  [/^[&*!|>%@`{]|: /, (text) => fail(`unsupported scalar: ${text}`)],
];

const plainScalar = (text: string): unknown => {
  const rule = PLAIN.find(([pattern]) => pattern.test(text));
  return rule === undefined ? text : rule[1](text);
};

const quoted = (text: string): string => {
  if (text.length < 2 || !text.endsWith(text.charAt(0))) fail(`unclosed quote: ${text}`);
  if (text.startsWith("'")) return text.slice(1, -1).replaceAll("''", "'");
  try {
    return JSON.parse(text) as string;
  } catch {
    return fail(`bad double-quoted text: ${text}`);
  }
};

/** A `[a, b, 1]` list of plain scalars. */
const flowSequence = (text: string): unknown[] => {
  if (!text.endsWith("]")) fail("flow sequence must end with ]");
  const inner = text.slice(1, -1);
  if (/["'[\]{}]/.test(inner)) fail("only plain items are supported in a flow sequence");
  return inner.trim() === "" ? [] : inner.split(",").map((item) => plainScalar(item.trim()));
};

/** One value: a quoted or plain scalar, or a flow sequence of plain scalars. */
const scalar = (raw: string): unknown => {
  const trimmed = raw.trim();
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) return quoted(trimmed);
  const text = trimmed.replace(/\s+#.*$/, "");
  return text.startsWith("[") ? flowSequence(text) : plainScalar(text);
};

const KEY_LINE = /^([^\s#'"[\]{},&*!|>%@`-][^]*?):(?: +(.*))?$/;
const ITEM_LINE = /^ *-(?: +(.*))?$/;

/** The block list items from `lines[start]` on, and the index of the first line after them. */
const blockItems = (lines: readonly string[], start: number) => {
  const items: unknown[] = [];
  let index = start;
  for (let item = ITEM_LINE.exec(lines[index] ?? ""); item !== null;) {
    items.push(item[1] === undefined ? null : scalar(item[1]));
    index += 1;
    item = ITEM_LINE.exec(lines[index] ?? "");
  }
  if (/^\s/.test(lines[index] ?? "")) fail("nested maps are not supported");
  return { value: items.length > 0 ? items : null, next: index };
};

/** The `key: value` entry at `lines[index]`, and the index of the line after it. */
const entryAt = (lines: readonly string[], index: number) => {
  const line = lines[index] ?? "";
  const match = line.includes("\t") ? null : KEY_LINE.exec(line);
  if (match === null) return fail(`not a key: value line: ${line}`);
  const key = match[1] ?? "";
  const rest = match[2]?.trim() ?? "";
  if (rest !== "") return { key, value: scalar(rest), next: index + 1 };
  const block = blockItems(lines, index + 1);
  return { key, value: block.value, next: block.next };
};

/** Like Obsidian's `parseYaml`: `null` for empty text, else the map. */
export const parseYaml = (yaml: string): Record<string, unknown> | null => {
  const lines = yaml.split(/\r?\n/).filter((line) => line.trim() !== "" && !/^\s*#/.test(line));
  if (lines.length === 0) return null;
  const result: Record<string, unknown> = {};
  for (let index = 0; index < lines.length;) {
    const entry = entryAt(lines, index);
    if (Object.hasOwn(result, entry.key)) fail("Map keys must be unique");
    result[entry.key] = entry.value;
    index = entry.next;
  }
  return result;
};

const NEEDS_QUOTES = /^[-?:,[\]{}#&*!|>'"%@`\s]|\s$|\n|: | #|:$/;

const writeText = (text: string): string =>
  text !== "" && !NEEDS_QUOTES.test(text) && plainScalar(text) === text
    ? text
    : JSON.stringify(text);

const writeNumber = (value: number): string => {
  if (Number.isNaN(value)) return ".nan";
  if (Number.isFinite(value)) return String(value);
  return value > 0 ? ".inf" : "-.inf";
};

const writeScalar = (value: unknown): string => {
  if (value === null) return "";
  if (typeof value === "boolean") return String(value);
  if (typeof value === "number") return writeNumber(value);
  if (typeof value === "string") return writeText(value);
  throw new Error(`stringifyYaml (test double): unsupported value ${JSON.stringify(value)}`);
};

const writeEntry = ([key, value]: readonly [string, unknown]): string => {
  const name = writeText(key);
  if (!Array.isArray(value)) {
    const text = writeScalar(value);
    return text === "" ? `${name}:\n` : `${name}: ${text}\n`;
  }
  if (value.length === 0) return `${name}: []\n`;
  return `${name}:\n${value.map((item) => `  - ${writeScalar(item)}\n`).join("")}`;
};

/** Like Obsidian's `stringifyYaml` for a flat map; ends with a newline, `{}\n` when empty. */
export const stringifyYaml = (value: Readonly<Record<string, unknown>>): string => {
  const entries = Object.entries(value).filter(([, inner]) => inner !== undefined);
  return entries.length === 0 ? "{}\n" : entries.map(writeEntry).join("");
};
