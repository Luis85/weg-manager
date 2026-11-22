import { Result } from "effect";
import {
  editNoteText,
  frontmatterYaml,
  newNoteText,
  splitNoteText,
  type NoteText,
} from "../../domain/notes";
import { copyFrontmatter } from "./frontmatter";
import {
  NoteUnreadableError,
  NoteWriteRefusedError,
  applyPatch,
  type Frontmatter,
  type FrontmatterChange,
  type FrontmatterPatch,
} from "./index";

/** A new note's text, written by the same serialiser as `updateNoteText` writes. */
export { newNoteText };

/** A YAML parser: Obsidian's `parseYaml` in the plugin. It throws for YAML it cannot read. */
export type ParseYaml = (yaml: string) => unknown;

/** What an update writes: the note's new text and its frontmatter as written. */
export type UpdatedText = { readonly text: string; readonly frontmatter: Frontmatter };

/** Ordered and exact equality of parsed YAML: same keys in the same order, `Object.is` leaves. */
const same = (a: unknown, b: unknown): boolean => {
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return Object.is(a, b);
  }
  const keys = Object.keys(a);
  const others = Object.keys(b);
  return (
    Array.isArray(a) === Array.isArray(b) &&
    keys.length === others.length &&
    keys.every(
      (key, index) => key === others[index] && same(Reflect.get(a, key), Reflect.get(b, key)),
    )
  );
};

/** The frontmatter YAML reads from `note`: `{}` without a block or for an empty one. */
const readFrontmatter = (
  note: NoteText,
  parse: ParseYaml,
): Result.Result<Frontmatter, "unreadable"> => {
  const yaml = frontmatterYaml(note);
  if (yaml === undefined) return Result.succeed({});
  const read = Result.try(() => parse(yaml));
  if (Result.isFailure(read)) return Result.fail("unreadable");
  const parsed = read.success;
  // `parseYaml` gives null for a block without content.
  if (parsed === null) return Result.succeed({});
  return typeof parsed === "object" && !Array.isArray(parsed)
    ? Result.succeed(parsed as Frontmatter)
    : Result.fail("unreadable");
};

/** The patch without what changes nothing: a key set to its value, a key removed that is absent. */
const effectivePatch = (current: Frontmatter, patch: FrontmatterPatch) => {
  const wanted = patch.set ?? {};
  const set = Object.fromEntries(
    Object.entries(wanted).filter(([key, value]) => !same(current[key], value)),
  );
  const remove = Object.keys(current).filter(
    (key) => patch.remove?.includes(key) === true && !Object.hasOwn(wanted, key),
  );
  return { set, remove };
};

const refused = () => Result.fail(new NoteWriteRefusedError({ reason: "layout" }));

/**
 * One update of a note's text, as the Obsidian adapter runs it inside `vault.process`: reads the
 * frontmatter from `text` with `parse`, lets `change` decide on it, and edits only the lines of
 * the keys the patch changes (`editNoteText`). Then it parses the new text and checks that YAML
 * reads exactly the frontmatter the patch means, every other key equal and in its order; if not,
 * nothing is written (`NoteWriteRefusedError`, reason `layout`). Broken YAML, or YAML that is no
 * map, is `NoteUnreadableError`, and `change` is not asked. A patch that changes nothing returns
 * `text` as it is. What `change` throws reaches the caller.
 */
export const updateNoteText = <E>(
  text: string,
  change: FrontmatterChange<E>,
  parse: ParseYaml,
): Result.Result<UpdatedText, E | NoteUnreadableError | NoteWriteRefusedError> => {
  const note = splitNoteText(text);
  if (Result.isFailure(note)) return refused();
  const current = readFrontmatter(note.success, parse);
  if (Result.isFailure(current)) {
    // No parser message as the cause: it quotes the note.
    // Stryker disable next-line StringLiteral: the cause's text is never shown.
    return Result.fail(new NoteUnreadableError({ cause: new Error("frontmatter is no YAML map") }));
  }
  const decided = change(copyFrontmatter(current.success));
  if (Result.isFailure(decided)) return Result.fail(decided.failure);
  const patch = effectivePatch(current.success, decided.success);
  const expected: Record<string, unknown> = copyFrontmatter(current.success);
  applyPatch(expected, patch);
  // Nothing to write: also a note the line edit could not handle is left alone, not refused.
  if (Object.keys(patch.set).length === 0 && patch.remove.length === 0) {
    return Result.succeed({ text, frontmatter: expected });
  }
  const edited = editNoteText(note.success, current.success, patch);
  if (Result.isFailure(edited)) return refused();
  const written = splitNoteText(edited.success);
  const reread = Result.isSuccess(written) ? readFrontmatter(written.success, parse) : written;
  return Result.isSuccess(reread) && same(reread.success, expected)
    ? Result.succeed({ text: edited.success, frontmatter: expected })
    : refused();
};
