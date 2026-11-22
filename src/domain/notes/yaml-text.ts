/**
 * Writes frontmatter entries as YAML text, the one serialiser for new notes and for updates
 * (ADR 0007). Text is written plain where every YAML reader gives it back as the same text, else
 * double-quoted with escapes. "Every reader" is YAML 1.2 core, as Obsidian parses, and YAML 1.1,
 * as older tools an agent may use do: `yes`, `off`, `1_000` or `12:30` mean something else
 * there, so they are quoted too. Dates stay plain, because both Obsidian's parser and Obsidian's
 * own writes keep `2026-01-01` as text.
 */

/** Words YAML 1.2 or 1.1 reads as null, a boolean, or a merge or value key. */
const RESERVED =
  /^(?:~|null|Null|NULL|true|True|TRUE|false|False|FALSE|y|Y|yes|Yes|YES|n|N|no|No|NO|on|On|ON|off|Off|OFF|<<|=)$/;

/**
 * Text YAML 1.2 or 1.1 reads as a number: decimal (also `.`, `e0` and the empty text, which 1.1
 * or every version reads as something else than text), octal, hex, binary, sexagesimal, inf, nan.
 */
const NUMBERS = [
  /^[-+]?[\d_]*\.?[\d_]*(?:[eE][-+]?\d+)?$/,
  /^[-+]?0(?:b[01_]+|o[0-7_]+|x[\dA-Fa-f_]+)$/,
  /^[-+]?[\d_]+(?::[0-5]?\d)+(?:\.[\d_]*)?$/,
  /^[-+]?\.(?:inf|Inf|INF)$/,
  /^\.(?:nan|NaN|NAN)$/,
];

/**
 * A start that is something other than plain text: a YAML indicator, a space, or `...`, which
 * ends the document where a key starts a line.
 */
const INDICATOR = /^(?:[-?:,[\]{}#&*!|>'"%@` ]|\.\.\.)/;

/** Plain text ends where `: ` or ` #` starts a value or a comment. */
const BREAKS_PLAIN = /: |:$| #| $/;

/**
 * Characters a YAML file may hold as they are: printable (YAML 1.2 `c-printable`) and not read as
 * a line break or a BOM by any reader (NEL, LS, PS and U+FEFF are escaped).
 */
const PRINTABLE: readonly (readonly [number, number])[] = [
  [0x20, 0x7e],
  [0xa0, 0xd7ff],
  [0xe000, 0xfffd],
  [0x1_00_00, 0x10_ff_ff],
];
const ESCAPED = new Set([0x20_28, 0x20_29, 0xfe_ff]);

const isPrintable = (code: number): boolean =>
  !ESCAPED.has(code) && PRINTABLE.some(([from, to]) => code >= from && code <= to);

const allPrintable = (text: string): boolean => {
  for (const character of text) {
    if (!isPrintable(character.codePointAt(0) ?? 0)) return false;
  }
  return true;
};

const isPlain = (text: string): boolean =>
  !INDICATOR.test(text) &&
  !BREAKS_PLAIN.test(text) &&
  !RESERVED.test(text) &&
  !NUMBERS.some((number) => number.test(text)) &&
  allPrintable(text);

const NAMED_ESCAPES: Readonly<Record<string, string>> = {
  "\\": "\\\\",
  '"': '\\"',
  "\n": "\\n",
  "\t": "\\t",
  "\r": "\\r",
};

/** `"…"` with every character escaped that is not printable, per UTF-16 code unit. */
const doubleQuoted = (text: string): string => {
  let quoted = "";
  for (const character of text) {
    const named = NAMED_ESCAPES[character];
    if (named !== undefined) quoted += named;
    else if (isPrintable(character.codePointAt(0) ?? 0)) quoted += character;
    else quoted += `\\u${character.charCodeAt(0).toString(16).padStart(4, "0")}`;
  }
  return `"${quoted}"`;
};

const writeText = (text: string): string => (isPlain(text) ? text : doubleQuoted(text));

const writeNumber = (value: number): string => {
  if (Number.isNaN(value)) return ".nan";
  if (value === Infinity) return ".inf";
  if (value === -Infinity) return "-.inf";
  return Object.is(value, -0) ? "-0" : String(value);
};

const unsupported = (): never => {
  // No value in the message: it may be note content.
  throw new TypeError(
    "yamlEntry: unsupported value; a record holds text, numbers, booleans, null and lists of those",
  );
};

/** One scalar as YAML text; `null` is written `null`, as a list item needs. */
const writeScalar = (value: unknown): string => {
  if (value === null) return "null";
  if (typeof value === "string") return writeText(value);
  if (typeof value === "number") return writeNumber(value);
  if (typeof value === "boolean") return String(value);
  return unsupported();
};

/**
 * The lines of one top-level entry, each ending with `eol`: `key: value`, `key:` for null (as
 * Obsidian writes an empty property), a list as `key:` and `  - item` lines (`key: []` when
 * empty). Throws for any other value (a nested map, `undefined`), which no record holds.
 */
export const yamlEntry = (key: string, value: unknown, eol: string): string => {
  const name = writeText(key);
  if (value === null) return `${name}:${eol}`;
  if (!Array.isArray(value)) return `${name}: ${writeScalar(value)}${eol}`;
  if (value.length === 0) return `${name}: []${eol}`;
  return `${name}:${eol}${value.map((item: unknown) => `  - ${writeScalar(item)}${eol}`).join("")}`;
};
