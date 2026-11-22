import { Result } from "effect";
import type { Frontmatter, FrontmatterPatch } from "./note-type";
import { yamlEntry } from "./yaml-text";

/**
 * A note's text as lines, edited where only the keys an update sets or removes change (ADR 0007,
 * DV-01: unknown keys, their order and form, comments and the body stay byte for byte). Pure, and
 * without a YAML parser: the caller parses the frontmatter and checks the result
 * (`src/application/notes/note-text.ts`). A text this cannot edit safely is `"layout"`.
 */

const BOM = "\uFEFF";
const FENCE = "---";

/** The frontmatter block: the opening fence line, the lines between, the closing fence line. */
type Block = {
  readonly open: string;
  readonly lines: readonly string[];
  readonly close: string;
};

/** A note's text cut where Obsidian's metadata cache cuts it. */
export type NoteText = {
  /** A BOM, or nothing. */
  readonly bom: string;
  /** The line break of lines this writes: the opening fence's, else the text's first one. */
  readonly eol: string;
  readonly block: Block | undefined;
  /** Everything after the block: the body. */
  readonly rest: string;
};

/** One top-level key and the lines it spans, `end` exclusive. */
type Entry = { readonly key: string; readonly start: number; end: number };

/** The lines of `text`, each with its own line break (`\n` or `\r\n`); a lone `\r` is content. */
const linesOf = (text: string): string[] =>
  Array.from(text.matchAll(/[^\n]*\n|[^\n]+/g), ([line]) => line);

/** A line without its line break (a line holds one `\n` at most, at its end). */
const contentOf = (line: string): string => line.replace(/\r?\n/, "");

const lineBreakOf = (line: string): string => line.slice(contentOf(line).length);

/**
 * Whether the first line opens a block: `true` for a fence, `false` for no block (also `---`
 * with spaces after it, as both of Obsidian's readers see it), `"layout"` for any other line
 * that starts with `---` or a fence without a line break after it.
 */
const opening = (first: string): boolean | "layout" => {
  const content = contentOf(first);
  if (!content.startsWith(FENCE) || /^[ \t]+$/.test(content.slice(FENCE.length))) return false;
  return content === FENCE && lineBreakOf(first) !== "" ? true : "layout";
};

/** A note without a block: its first line break is the one new lines get. */
const unfenced = (bom: string, content: string): NoteText => ({
  bom,
  eol: /\r?\n/.exec(content)?.[0] ?? "\n",
  block: undefined,
  rest: content,
});

/**
 * The note's frontmatter block, where Obsidian's metadata cache finds it (measured in Obsidian
 * 1.15.1): after an optional BOM, a first line `---`, up to the next line that starts with
 * `---`. Without such a line, or with spaces after the first `---`, there is no block. Where
 * Obsidian's own readers disagree, or it is not known that they agree, this refuses
 * (`"layout"`): a closing line that only starts with `---` (`----`, `---  `) closes the block for
 * the metadata cache but not for `getFrontMatterInfo`, and the cache reads a block after lone
 * carriage returns, `getFrontMatterInfo` does not. A first line `----` or `---x` is refused too.
 */
export const splitNoteText = (text: string): Result.Result<NoteText, "layout"> => {
  const bom = text.startsWith(BOM) ? BOM : "";
  const content = text.slice(bom.length);
  const lines = linesOf(content);
  const [first] = lines;
  if (first === undefined) return Result.succeed(unfenced(bom, content));
  const opens = opening(first);
  if (opens === "layout") return Result.fail("layout");
  const closing = opens
    ? lines.findIndex((line, index) => index > 0 && line.startsWith(FENCE))
    : -1;
  const close = lines[closing];
  if (close === undefined) return Result.succeed(unfenced(bom, content));
  if (contentOf(close) !== FENCE) return Result.fail("layout");
  return Result.succeed({
    bom,
    eol: lineBreakOf(first),
    block: { open: first, lines: lines.slice(1, closing), close },
    rest: lines.slice(closing + 1).join(""),
  });
};

/** The YAML between the fences, for the parser; `undefined` without a block. */
export const frontmatterYaml = (note: NoteText): string | undefined => note.block?.lines.join("");

const PLAIN_KEY = /^([^-?:,[\]{}#&*!|>'"%@`\s][^]*?)[ \t]*:(?:[ \t]|$)/;
const DOUBLE_QUOTED_KEY = /^"((?:[^"\\]|\\.)*)"[ \t]*:(?:[ \t]|$)/;
const SINGLE_QUOTED_KEY = /^'((?:[^']|'')*)'[ \t]*:(?:[ \t]|$)/;

/** The JSON reading of YAML double-quoted text; YAML-only escapes (`\x41`) are not read. */
const decodeDoubleQuoted = (inner: string): string | undefined =>
  Result.getOrUndefined(Result.try(() => JSON.parse(`"${inner}"`) as string));

/** The key a top-level line starts with, written plain or quoted; `undefined` if none. */
const keyOf = (line: string): string | undefined => {
  const double = DOUBLE_QUOTED_KEY.exec(line);
  // Stryker disable next-line StringLiteral: the group always takes part in a match.
  if (double !== null) return decodeDoubleQuoted(double[1] ?? "");
  const single = SINGLE_QUOTED_KEY.exec(line);
  if (single !== null) {
    // Stryker disable next-line StringLiteral: the group always takes part in a match.
    const inner = single[1] ?? "";
    return inner.replaceAll("''", "'");
  }
  const plain = PLAIN_KEY.exec(line)?.[1];
  // Stryker disable next-line ConditionalExpression: `test` of undefined is false, so either way it returns undefined.
  return plain === undefined || /[ \t]#/.test(plain) ? undefined : plain;
};

/** A line that continues the entry above it: indented, or an item of a list at column 0. */
const continues = (line: string): boolean => /^[ \t]/.test(line) || /^-(?:[ \t]|$)/.test(line);

/**
 * The top-level entries of the block: a key line, then every line that continues it (block
 * lists, block scalars, multi-line values). Blank and comment lines between two continuation
 * lines belong to the entry; those after its last line do not. Any other line is `"layout"`.
 */
const entriesOf = (lines: readonly string[]): Result.Result<Entry[], "layout"> => {
  const entries: Entry[] = [];
  for (const [index, line] of lines.entries()) {
    const content = contentOf(line);
    if (/^[ \t]*$/.test(content) || content.startsWith("#")) continue;
    const last = entries.at(-1);
    if (continues(content)) {
      if (last === undefined) return Result.fail("layout");
      last.end = index + 1;
      continue;
    }
    const key = keyOf(content);
    if (key === undefined) return Result.fail("layout");
    entries.push({ key, start: index, end: index + 1 });
  }
  return Result.succeed(entries);
};

/** The keys found are exactly the keys YAML read, once each, so every edit lands where it means. */
const sameKeys = (entries: readonly Entry[], current: Frontmatter): boolean => {
  const keys = new Set(entries.map(({ key }) => key));
  return (
    keys.size === entries.length &&
    keys.size === Object.keys(current).length &&
    [...keys].every((key) => Object.hasOwn(current, key))
  );
};

/**
 * The block's lines with `patch` applied: each entry the patch sets is replaced, each it removes
 * dropped, every other line kept; new keys follow at the end, in the patch's order.
 */
const rewrite = (
  lines: readonly string[],
  entries: readonly Entry[],
  patch: FrontmatterPatch,
  eol: string,
): { readonly written: string[]; readonly added: number } => {
  const set = patch.set ?? {};
  const removed = new Set(patch.remove);
  const written: string[] = [];
  let next = 0;
  for (const { key, start, end } of entries) {
    written.push(...lines.slice(next, start));
    next = end;
    if (Object.hasOwn(set, key)) written.push(yamlEntry(key, set[key], eol));
    else if (!removed.has(key)) written.push(...lines.slice(start, end));
  }
  written.push(...lines.slice(next));
  const found = new Set(entries.map(({ key }) => key));
  const added = Object.keys(set).filter((key) => !found.has(key));
  written.push(...added.map((key) => yamlEntry(key, set[key], eol)));
  return { written, added: added.length };
};

/**
 * The note's text around the written lines: in its block's fences; in new fences when it had no
 * block and keys were added; without fences when every line of its block went.
 */
const assemble = (
  { bom, eol, block, rest }: NoteText,
  written: readonly string[],
  added: boolean,
  hadLines: boolean,
): string => {
  if (block === undefined) {
    return added ? `${bom}${FENCE}${eol}${written.join("")}${FENCE}${eol}${rest}` : `${bom}${rest}`;
  }
  if (hadLines && written.length === 0) return `${bom}${rest}`;
  return `${bom}${block.open}${written.join("")}${block.close}${rest}`;
};

/**
 * `note` with `patch` applied as lines: a key that is set and exists gets new lines in its place,
 * a new key is appended at the end of the block (a block is added when there is none), a removed
 * key's lines go, and a block left without any line goes with its fences, as Obsidian does. Every
 * other byte stays, and new lines use the note's line break. `current` is the frontmatter YAML
 * read from `note`; when the keys found by line differ from it, the edit is `"layout"`. An empty
 * patch returns the text unchanged. Throws for a value no record holds (see `yamlEntry`).
 */
export const editNoteText = (
  note: NoteText,
  current: Frontmatter,
  patch: FrontmatterPatch,
): Result.Result<string, "layout"> => {
  const lines = note.block?.lines ?? [];
  const entries = entriesOf(lines);
  if (Result.isFailure(entries)) return Result.fail(entries.failure);
  if (!sameKeys(entries.success, current)) return Result.fail("layout");
  const { written, added } = rewrite(lines, entries.success, patch, note.eol);
  return Result.succeed(assemble(note, written, added > 0, lines.length > 0));
};

/**
 * The text of a new note: the frontmatter in its order, written as `editNoteText` writes it, then
 * the body. Without a value to write, the body alone. `undefined` values are left out, as
 * Obsidian's `stringifyYaml` leaves them out.
 */
export const newNoteText = (frontmatter: Frontmatter, body: string): string => {
  const entries = Object.entries(frontmatter).filter(([, value]) => value !== undefined);
  return entries.length === 0
    ? body
    : `${FENCE}\n${entries.map(([key, value]) => yamlEntry(key, value, "\n")).join("")}${FENCE}\n${body}`;
};
