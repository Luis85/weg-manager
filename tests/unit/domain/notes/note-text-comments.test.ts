import { Result } from "effect";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import {
  editNoteText,
  frontmatterYaml,
  splitNoteText,
} from "../../../../src/domain/notes/note-text";
import type { FrontmatterPatch } from "../../../../src/domain/notes";

/** Edits `text` as the store does: on the frontmatter YAML reads from it. */
const edited = (text: string, patch: FrontmatterPatch): string => {
  const note = splitNoteText(text);
  if (Result.isFailure(note)) throw new Error("the test note has no supported layout");
  const yaml = frontmatterYaml(note.success);
  const current = (yaml === undefined ? null : (parse(yaml) as unknown)) ?? {};
  const result = editNoteText(note.success, current as Record<string, unknown>, patch);
  if (Result.isFailure(result)) throw new Error("the edit was refused");
  return result.success;
};

/** The block of `lines`, edited with `patch`, as lines again. */
const editedLines = (lines: readonly string[], patch: FrontmatterPatch): string[] =>
  edited(`---\n${lines.join("\n")}\n---\nbody\n`, patch)
    .split("\n")
    .slice(1, -3);

describe("editNoteText and a comment at the end of a written line", () => {
  it("writes the new value before the comment", () => {
    expect(editedLines(["kind: WEG # Art"], { set: { kind: "Haus" } })).toEqual([
      "kind: Haus # Art",
    ]);
  });

  it("keeps the white space the user put before the comment", () => {
    expect(
      editedLines(["kind: WEG\t  # Art", "a: 1    #  b"], { set: { kind: "Haus", a: 22 } }),
    ).toEqual(["kind: Haus\t  # Art", "a: 22    #  b"]);
  });

  it("keeps the comment with CRLF line breaks", () => {
    expect(edited("---\r\nkind: WEG # Art\r\n---\r\n", { set: { kind: "Haus" } })).toBe(
      "---\r\nkind: Haus # Art\r\n---\r\n",
    );
  });

  it("keeps a comment after a key without a value, and writes one there", () => {
    expect(editedLines(["k: # leer", "m: x # weg"], { set: { k: "v", m: null } })).toEqual([
      "k: v # leer",
      "m: # weg",
    ]);
  });

  it.each([
    ["inside double quotes", 'name: "A # B"'],
    ["inside single quotes", "name: 'A # B'"],
    ["after an escaped quote inside double quotes", 'name: "A \\" # B"'],
    ["after a doubled quote inside single quotes", "name: 'A '' # B'"],
    ["without a space before it", "name: A#B"],
    ["inside a quoted item of a flow list", 'name: [a, "b # c"]'],
    ["inside a quoted value of a flow map", "name: {a: 'b # c'}"],
    ["inside quoted text right after a colon in a flow map", 'name: {"a":"b # c"}'],
    ["inside a quoted item after plain text with a tag sign", 'name: [a!b, "c # d"]'],
    ["inside a nested flow list", 'name: [a, [b, "c # d"]]'],
  ])("does not read a # %s as a comment", (_, line) => {
    expect(editedLines([line], { set: { name: "C" } })).toEqual(["name: C"]);
  });

  it.each([
    ["double-quoted text", 'name: "A # B" # c'],
    ["single-quoted text", "name: 'A '' B' # c"],
    ["text with a quote inside", "name: it's here # c"],
    ["text with a quote after a space", 'name: a "b # c'],
    ["a flow list with quoted items", "name: [a, 'b # x', \"c\"] # c"],
    ["a nested flow map", 'name: {a: [1, 2], "b": c} # c'],
    ["a tag", "name: !!str 01067 # c"],
    ["a tag before quoted text", 'name: !!str "a # b" # c'],
    ["a block scalar header", "name: | # c"],
    ["brackets inside plain text", "name: a[b] # c"],
    ["a bracket, a comma and a quote inside plain text", 'name: a[b, "c # d'],
    ["a comma and a quote inside plain text", 'name: a, "b # c'],
    ["a colon and a quote inside plain text", 'name: a:"b # c'],
    ["a backslash inside single quotes", "name: 'a\\' # c"],
    ["a lone tag", "name: !!null # c"],
  ])("finds the comment after %s", (_, line) => {
    const lines = line.endsWith("| # c") ? [line, "  text"] : [line];
    const comment = line.slice(line.lastIndexOf(" #"));
    expect(editedLines(lines, { set: { name: "C" } })).toEqual([`name: C${comment}`]);
  });

  it("keeps the comment on the key line when the new value is a block list", () => {
    expect(editedLines(["tags: a # Liste", "next: 1"], { set: { tags: ["x", "z"] } })).toEqual([
      "tags: # Liste",
      "  - x",
      "  - z",
      "next: 1",
    ]);
  });

  it("keeps the key line's comment of a value that spans lines; comments inside it go with it", () => {
    const lines = ["tags: # Liste", "  - a # erstes", "  # dazwischen", "  - b", "next: 1"];
    expect(editedLines(lines, { set: { tags: "t" } })).toEqual(["tags: t # Liste", "next: 1"]);
    const quoted = ['text: "eins #', '  zwei" # c', "next: 1"];
    expect(editedLines(quoted, { set: { text: "t" } })).toEqual(["text: t", "next: 1"]);
  });

  it("takes a removed key's comment with its line", () => {
    expect(editedLines(["a: 1 # über a", "b: 2 # über b"], { remove: ["a"] })).toEqual([
      "b: 2 # über b",
    ]);
  });

  it("writes a new key without a comment", () => {
    expect(editedLines(["a: 1 # c"], { set: { b: 2 } })).toEqual(["a: 1 # c", "b: 2"]);
  });
});
