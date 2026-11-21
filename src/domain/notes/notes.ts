import { Schema } from "effect";
import { parseSchemaMarker } from "./schema-marker";

/**
 * True when a note's frontmatter makes it a record: its `schema` is a string that starts with
 * `weg-manager.` (`parseSchemaMarker` says anything but `none`). Where the note lies does not
 * matter. A malformed marker counts, so the note is shown with its issue; whether the type and
 * version are known is the codec's question, not this one.
 */
export const isRecordFrontmatter = (frontmatter: Readonly<Record<string, unknown>>): boolean =>
  parseSchemaMarker(frontmatter["schema"]).kind !== "none";

/** Why a note name cannot become a file name. The message catalog words each code. */
export const NoteNameIssue = Schema.Literals(["empty", "forbidden-character", "leading-dot"]);
export type NoteNameIssue = typeof NoteNameIssue.Type;

/**
 * Characters that no file name may hold on one of the platforms a vault syncs to: the path
 * separators, and what Windows and Obsidian reject.
 */
const FORBIDDEN_CHARACTER = /[\\/:*?"<>|]/;

/**
 * The issue of a note name (the file name without `.md`), or `undefined` when it is usable. A
 * leading dot is refused because Obsidian hides such files, so the note would never be listed.
 */
export const noteNameIssue = (name: string): NoteNameIssue | undefined => {
  if (name.trim() === "") return "empty";
  if (FORBIDDEN_CHARACTER.test(name)) return "forbidden-character";
  return name.startsWith(".") ? "leading-dot" : undefined;
};

/** The name for the `attempt`-th try when names clash: `Name`, `Name (2)`, `Name (3)`, … */
export const clashName = (name: string, attempt: number): string =>
  attempt === 1 ? name : `${name} (${attempt})`;

/**
 * What two file names have to share to clash: Windows and macOS, the product's platforms, ignore
 * case, and macOS stores umlauts decomposed (NFD) where the others compose them (NFC). Names with
 * the same key are one file there, or two files a sync cannot keep apart. `toLowerCase` uses
 * Unicode's default case mapping, so the key is the same in every locale.
 */
export const clashKey = (name: string): string => name.normalize("NFC").toLowerCase();
