import { Result } from "effect";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import {
  editNoteText,
  frontmatterYaml,
  newNoteText,
  splitNoteText,
  type NoteTextPatch,
} from "../../../../src/domain/notes/note-text";

const BOM = "\uFEFF";

/** The reviewer's note: a comment and unknown keys that a full YAML round trip would change. */
const REVIEWED = [
  "---",
  "# Kommentar des Beirats",
  "plz: 01067",
  "version: 1.10",
  "iban_nr: 12345678901234567890",
  "flow: [a, b]",
  "quoted: 'yes'",
  "schema: weg-manager.community/v1",
  "name: Ahornweg 12",
  "kind: WEG",
  "---",
  "Body",
  "",
].join("\n");

const split = (text: string) => {
  const note = splitNoteText(text);
  if (Result.isFailure(note)) throw new Error("the test note has no supported layout");
  return note.success;
};

/** Edits `text` as the store does: on the frontmatter YAML reads from it. */
const edit = (text: string, patch: NoteTextPatch) => {
  const note = split(text);
  const yaml = frontmatterYaml(note);
  const current = (yaml === undefined ? null : (parse(yaml) as unknown)) ?? {};
  return editNoteText(note, current as Record<string, unknown>, patch);
};

const edited = (text: string, patch: NoteTextPatch): string => {
  const result = edit(text, patch);
  if (Result.isFailure(result)) throw new Error("the edit was refused");
  return result.success;
};

describe("splitNoteText", () => {
  it.each([
    ["LF", "---\na: 1\n---\nbody\n", "a: 1\n"],
    ["CRLF", "---\r\na: 1\r\n---\r\nbody\r\n", "a: 1\r\n"],
    ["a BOM", `${BOM}---\na: 1\n---\nbody\n`, "a: 1\n"],
    ["a BOM and CRLF", `${BOM}---\r\na: 1\r\n---\r\nbody\r\n`, "a: 1\r\n"],
    ["a closing fence at the end of the file", "---\na: 1\n---", "a: 1\n"],
    ["an empty block", "---\n---\nbody\n", ""],
    ["a closing fence with CRLF after an LF block", "---\na: 1\n---\r\nbody", "a: 1\n"],
    ["a document end marker inside", "---\na: 1\n...\n---\n", "a: 1\n...\n"],
  ])("finds the frontmatter of a note with %s", (_, text, yaml) => {
    expect(frontmatterYaml(split(text))).toBe(yaml);
  });

  it.each([
    ["no fence", "# Title\n\nbody\n"],
    ["an empty text", ""],
    ["a fence that is not on the first line", "\n---\na: 1\n---\n"],
    ["a fence with a space after it", "--- \na: 1\n---\n"],
    ["a fence with spaces and a tab after it", "--- \t \na: 1\n---\n"],
    ["no closing fence", "---\na: 1\nbody\n"],
  ])("finds no frontmatter in a note with %s, as Obsidian's metadata cache", (_, text) => {
    expect(frontmatterYaml(split(text))).toBeUndefined();
  });

  it.each([
    ["a closing fence with text after it", "---\na: 1\n--- x\n---\n"],
    ["a closing fence with spaces after it", "---\na: 1\n---  \nbody\n"],
    ["a closing line of four dashes", "---\na: 1\n----\nbody\n"],
    ["lone carriage returns", "---\ra: 1\r---\rbody\r"],
    ["an opening fence of four dashes", "----\na: 1\n---\n"],
    ["an opening fence with text after it", "--- x\na: 1\n---\n"],
    ["an opening fence with text and a space after it", "---x \na: 1\n---\n"],
    ["only a fence", "---"],
  ])("refuses a note with %s, where Obsidian's own readers disagree", (_, text) => {
    expect(splitNoteText(text)).toEqual(Result.fail("layout"));
  });
});

describe("editNoteText", () => {
  it("changes only the line of the key it sets", () => {
    expect(edited(REVIEWED, { set: { kind: "Haus" } })).toBe(
      REVIEWED.replace("kind: WEG", "kind: Haus"),
    );
  });

  it("keeps a BOM and writes the note's line break", () => {
    const text = `${BOM}---\r\nschema: x\r\nkind: WEG\r\n---\r\nBody\r\nLine 2\r\n`;
    expect(edited(text, { set: { kind: "Haus", added: ["a", "b"] } })).toBe(
      `${BOM}---\r\nschema: x\r\nkind: Haus\r\nadded:\r\n  - a\r\n  - b\r\n---\r\nBody\r\nLine 2\r\n`,
    );
  });

  it("replaces every line of a key it sets: block lists, block scalars, continuation lines", () => {
    const text = [
      "---",
      "tags:",
      "  - a",
      "",
      "  - b",
      "compact:",
      "- x",
      "- y",
      "text: |",
      "  line 1",
      "",
      "  line 3",
      "folded: >-",
      "  one",
      "  two",
      "plain: first",
      "  second",
      "last: 1",
      "---",
      "",
    ].join("\n");
    expect(
      edited(text, {
        set: { tags: "t", compact: "c", text: "x", folded: "f", plain: "p" },
      }),
    ).toBe("---\ntags: t\ncompact: c\ntext: x\nfolded: f\nplain: p\nlast: 1\n---\n");
  });

  it("finds a key written in quotes or with spaces before the colon", () => {
    const text = '---\n"name": A\n\'kind\': WEG\nunit_label  : E\n"a\\"b": 1\n---\n';
    expect(edited(text, { set: { name: "B", kind: "Haus", unit_label: "F", 'a"b': 2 } })).toBe(
      '---\nname: B\nkind: Haus\nunit_label: F\na"b: 2\n---\n',
    );
  });

  it("removes every line of a key, and keeps comments and blank lines around it", () => {
    const text = "---\na: 1\n# about b\nb:\n  - x\n  - y\n\nc: 3 # stays\n---\nbody\n";
    expect(edited(text, { remove: ["b"] })).toBe(
      "---\na: 1\n# about b\n\nc: 3 # stays\n---\nbody\n",
    );
  });

  it("appends a new key at the end of the block, after trailing comments", () => {
    expect(edited("---\na: 1\n# end\n---\nbody\n", { set: { b: "x" } })).toBe(
      "---\na: 1\n# end\nb: x\n---\nbody\n",
    );
    expect(edited("---\n---\nbody\n", { set: { b: null } })).toBe("---\nb:\n---\nbody\n");
  });

  it("writes new keys in the order of the patch", () => {
    expect(edited("---\na: 1\n---\n", { set: { z: 1, a: 2, m: 3 } })).toBe(
      "---\na: 2\nz: 1\nm: 3\n---\n",
    );
  });

  it("adds a block with every new key to a note without one", () => {
    expect(edited("# Plain\n", { set: { a: 1, b: 2 } })).toBe("---\na: 1\nb: 2\n---\n# Plain\n");
  });

  it("takes the first line break of a note without a block for the lines it adds", () => {
    expect(edited("# A\nB\r\n", { set: { k: "v" } })).toBe("---\nk: v\n---\n# A\nB\r\n");
  });

  it("keeps an empty block when the patch only removes keys it lacks", () => {
    expect(edited("---\n---\nbody\n", { remove: ["x"] })).toBe("---\n---\nbody\n");
  });

  it("finds a quoted key before a block list, and before a colon after spaces", () => {
    const text = '---\n"tags":\n  - a\n\'more\':\n  - b\n"name" : A\n---\n';
    expect(edited(text, { set: { tags: "t", more: "m", name: "B" } })).toBe(
      "---\ntags: t\nmore: m\nname: B\n---\n",
    );
  });

  it("reads a key with quotes inside as a plain key", () => {
    const text = "---\na \"b\": 1\nc 'd': 2\n---\n";
    expect(edited(text, { set: { 'a "b"': 3, "c 'd'": 4 } })).toBe(
      "---\na \"b\": 3\nc 'd': 4\n---\n",
    );
  });

  it("finds a key written in single quotes with a quote in it", () => {
    expect(edited("---\n'it''s': 1\n---\n", { set: { "it's": 2 } })).toBe("---\nit's: 2\n---\n");
  });

  it("counts an empty item of a list at column 0 as part of its key", () => {
    expect(edited("---\nlist:\n- a\n-\nnext: 1\n---\n", { set: { list: "x" } })).toBe(
      "---\nlist: x\nnext: 1\n---\n",
    );
  });

  it("adds a block to a note without one, after a BOM and with the note's line break", () => {
    expect(edited("# Plain\r\n", { set: { k: "v" } })).toBe("---\r\nk: v\r\n---\r\n# Plain\r\n");
    expect(edited(`${BOM}# Plain\n`, { set: { k: "v" } })).toBe(`${BOM}---\nk: v\n---\n# Plain\n`);
    expect(edited("", { set: { k: "v" } })).toBe("---\nk: v\n---\n");
  });

  it("drops the block when its last line goes, as Obsidian does", () => {
    expect(edited("---\nk: v\n---\n# Plain\n", { remove: ["k"] })).toBe("# Plain\n");
    expect(edited(`${BOM}---\r\nk: v\r\n---\r\nbody`, { remove: ["k"] })).toBe(`${BOM}body`);
  });

  it("keeps a block that only comments are left in", () => {
    expect(edited("---\n# c\nk: v\n---\n", { remove: ["k"] })).toBe("---\n# c\n---\n");
  });

  it("returns the text unchanged for an empty patch, also without a block", () => {
    expect(edited(REVIEWED, {})).toBe(REVIEWED);
    expect(edited("# Plain\n", { remove: ["x"] })).toBe("# Plain\n");
    expect(edited("---\na: 1\n---\n", { remove: ["x"] })).toBe("---\na: 1\n---\n");
  });

  it.each([
    ["a flow mapping", "---\n{a: 1, b: 2}\n---\n"],
    ["an anchored key", "---\n&a k: 1\n---\n"],
    ["an explicit key", "---\n? k\n: 1\n---\n"],
    ["a key YAML reads as a number", "---\n01: x\n---\n"],
    ["a quoted key with a YAML-only escape", '---\n"\\x61": 1\n---\n'],
    ["a key with a comment in it", "---\na #b: 1\n---\n"],
    ["a plain key starting with a dash", "---\n-a: 1\n---\n"],
  ])("refuses %s, which a line edit could change unseen", (_, text) => {
    expect(edit(text, { set: { k: 2 } })).toEqual(Result.fail("layout"));
  });

  it.each(["a #b", "a\t#b"])("refuses a plain key %j, where YAML starts a comment", (key) => {
    const note = split(`---\n${key}: 1\n---\n`);
    expect(editNoteText(note, { [key]: 1 }, { set: { k: 1 } })).toEqual(Result.fail("layout"));
  });

  it("refuses lines it cannot place before the first key", () => {
    const note = split("---\n  indented: 1\n---\n");
    expect(editNoteText(note, { indented: 1 }, { set: { k: 1 } })).toEqual(Result.fail("layout"));
  });

  it("refuses when the keys it finds are not the keys YAML read", () => {
    const note = split("---\na: 1\n---\n");
    expect(editNoteText(note, { a: 1, b: 2 }, { set: { a: 2 } })).toEqual(Result.fail("layout"));
    expect(editNoteText(note, { b: 1 }, { set: { a: 2 } })).toEqual(Result.fail("layout"));
    expect(editNoteText(split("---\na: 1\na: 2\n---\n"), { a: 2 }, {})).toEqual(
      Result.fail("layout"),
    );
  });
});

describe("newNoteText", () => {
  it("writes the frontmatter in its order, then the body", () => {
    expect(
      newNoteText({ schema: "weg-manager.community/v1", tags: ["a", "b"], none: null }, "# A\n"),
    ).toBe("---\nschema: weg-manager.community/v1\ntags:\n  - a\n  - b\nnone:\n---\n# A\n");
  });

  it("writes the body alone without frontmatter, and leaves out undefined values", () => {
    expect(newNoteText({}, "body")).toBe("body");
    expect(newNoteText({ a: undefined }, "body")).toBe("body");
    expect(newNoteText({ a: undefined, b: 1 }, "")).toBe("---\nb: 1\n---\n");
  });

  it("writes values as the update does", () => {
    expect(newNoteText({ plz: "01067", word: "yes" }, "")).toBe(
      '---\nplz: "01067"\nword: "yes"\n---\n',
    );
  });
});
