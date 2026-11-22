/**
 * The comment at the end of a top-level key line (`kind: WEG # Art`), so an update writes the new
 * value before it and keeps it (owner decision of 2026-11-22, DV-01). Pure, and without a YAML
 * parser: the update's safety net (`src/application/notes/note-text.ts`) checks what YAML reads
 * from the edited text.
 *
 * A `#` starts a comment where YAML says so: after a space or a tab, outside quoted text. Quoted
 * text starts only where a value starts: after the key's colon, a tag or an anchor, and inside
 * `[…]` or `{…}` after `[`, `{`, `,` or `:`. So the quote in `it's` or `a "b` is text. A value
 * whose quotes do not close on the key line spans lines; a comment after it lies on a later line,
 * which goes with the value.
 */

const isBlank = (character: string): boolean => character === " " || character === "\t";

/** Quoted text at the start of a string: YAML's double-quoted (with escapes) and single-quoted. */
const QUOTED: Readonly<Record<string, RegExp>> = {
  '"': /^"(?:[^"\\]|\\.)*"/,
  "'": /^'(?:[^']|'')*'/,
};

/** A tag or an anchor before a value (`!!str`, `&a`): the value starts after it. */
const PROPERTY = /^[!&][^ \t]*/;

/**
 * The comment at the end of `value`, the text of a key line after the key's colon, with the
 * blanks before it (` # Art`); `""` when it has none.
 *
 * Inside `[…]` and `{…}` a quote may open text after `,` and `:`. Once the outermost one closes,
 * YAML allows nothing but a comment on the line, so the scan need not count brackets.
 */
export const lineComment = (value: string): string => {
  /** Where the blanks before the current character start. */
  let blanks = 0;
  let inFlow = false;
  /** Whether a value may start here, so a quote opens quoted text. */
  let valueStart = true;
  for (let index = 0; index < value.length; index += 1) {
    const character = value.charAt(index);
    if (isBlank(character)) {
      if (!isBlank(value.charAt(index - 1))) blanks = index;
      continue;
    }
    if (character === "#" && isBlank(value.charAt(index - 1))) return value.slice(blanks);
    const quoted = valueStart ? QUOTED[character] : undefined;
    const property = valueStart ? PROPERTY.exec(value.slice(index)) : null;
    if (quoted !== undefined) {
      const text = quoted.exec(value.slice(index));
      if (text === null) return "";
      index += text[0].length - 1;
    } else if (property !== null) {
      index += property[0].length - 1;
    } else if (valueStart && (character === "[" || character === "{")) {
      inFlow = true;
    } else {
      valueStart = inFlow && (character === "," || character === ":");
    }
  }
  return "";
};
