import { isControlCharacter } from "./fields";
import { clashKey } from "./notes";

/**
 * Characters a file name may not hold on one of the product's platforms (`\ / : * ? " < > |`)
 * and the ones that break a wikilink to the note (`# ^ [ ]`); control characters count too.
 */
const UNSAFE = new Set('\\/:*?"<>|#^[]');

/** `title` with each run of unsafe characters replaced by one hyphen. */
const replaceUnsafe = (title: string): string => {
  let result = "";
  let inRun = false;
  for (const character of title) {
    const unsafe = UNSAFE.has(character) || isControlCharacter(character);
    if (!unsafe) result += character;
    else if (!inRun) result += "-";
    inRun = unsafe;
  }
  return result;
};

/**
 * The file name (without `.md`) of a record's note: its title, with each run of unsafe characters
 * replaced by one hyphen, white space collapsed, and leading and trailing dots and spaces dropped
 * (a leading dot hides the note in Obsidian, a trailing one is lost on Windows). When nothing is
 * left, `fallback` (a value of the record that is never blank, such as a community's short code).
 * The title field keeps the user's text unchanged.
 */
export const recordFileName = (title: string, fallback: string): string => {
  const cleaned = replaceUnsafe(title)
    .replace(/\s+/g, " ")
    .replace(/^[.\s]+/, "")
    .replace(/[.\s]+$/, "");
  return cleaned === "" ? fallback : cleaned;
};

const CLASH_SUFFIX = / \(([2-9]|[1-9]\d+)\)$/;

/**
 * Whether a note's file name (without `.md`) is still the one the plugin gave it for `title`: the
 * title's file name, or that with a clash suffix ` (2)`, ` (3)`, … Case and Unicode form do not
 * count, as on Windows and macOS. Anything else is a name the user chose, which a rename keeps.
 */
export const followsTitle = (fileName: string, title: string, fallback: string): boolean => {
  const expected = clashKey(recordFileName(title, fallback));
  const actual = clashKey(fileName);
  return actual === expected || actual.replace(CLASH_SUFFIX, "") === expected;
};
