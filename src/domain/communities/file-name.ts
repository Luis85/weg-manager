import { clashKey } from "../notes";
import { isControlCharacter } from "./community-type";

/**
 * Characters a file name may not hold on one of the product's platforms (`\ / : * ? " < > |`)
 * and the ones that break a wikilink to the note (`# ^ [ ]`); control characters count too.
 */
const UNSAFE = new Set('\\/:*?"<>|#^[]');

/** `name` with each run of unsafe characters replaced by one hyphen. */
const replaceUnsafe = (name: string): string => {
  let result = "";
  let inRun = false;
  for (const character of name) {
    const unsafe = UNSAFE.has(character) || isControlCharacter(character);
    if (!unsafe) result += character;
    else if (!inRun) result += "-";
    inRun = unsafe;
  }
  return result;
};

/**
 * The file name (without `.md`) of a community's note: its name, with each run of unsafe
 * characters replaced by one hyphen, white space collapsed, and leading and trailing dots and
 * spaces dropped (a leading dot hides the note in Obsidian, a trailing one is lost on Windows).
 * When nothing is left, the short code. The `name` field keeps the user's text unchanged.
 */
export const communityFileName = (name: string, shortCode: string): string => {
  const cleaned = replaceUnsafe(name)
    .replace(/\s+/g, " ")
    .replace(/^[.\s]+/, "")
    .replace(/[.\s]+$/, "");
  return cleaned === "" ? shortCode : cleaned;
};

const CLASH_SUFFIX = / \(([2-9]|[1-9]\d+)\)$/;

/**
 * Whether a note's file name (without `.md`) is still the one the plugin gave it for `name`: the
 * name's file name, or that with a clash suffix ` (2)`, ` (3)`, … Case and Unicode form do not
 * count, as on Windows and macOS. Anything else is a name the user chose, which a rename keeps.
 */
export const followsName = (fileName: string, name: string, shortCode: string): boolean => {
  const expected = clashKey(communityFileName(name, shortCode));
  const actual = clashKey(fileName);
  return actual === expected || actual.replace(CLASH_SUFFIX, "") === expected;
};
