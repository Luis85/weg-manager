import { Result } from "effect";
import {
  array,
  assert,
  boolean,
  constant,
  constantFrom,
  double,
  oneof,
  property,
  record,
  string,
  subarray,
  tuple,
  uniqueArray,
  type Arbitrary,
} from "fast-check";
import { describe, expect, it, vi } from "vitest";
import { parse } from "yaml";
import {
  NoteUnreadableError,
  NoteWriteRefusedError,
  applyPatch,
  type Frontmatter,
  type FrontmatterChange,
} from "../../../../src/application/notes";
import { updateNoteText } from "../../../../src/application/notes/note-text";

const BOM = "\uFEFF";

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

const setting =
  (set: Frontmatter, remove: readonly string[] = []): FrontmatterChange<never> =>
  () =>
    Result.succeed({ set, remove });

/** A parser that throws for the edited text, as a parser bug would. */
const failingOnEdit = (yaml: string): unknown => {
  if (yaml.includes("a: 3")) throw new Error("parser bug");
  return parse(yaml);
};

/** A parser that reads the edited list `[3]` as the map `{ 0: 3 }`. */
const listAsMap = (yaml: string): unknown =>
  yaml.includes("- 3") ? { a: { 0: 3 }, b: 2 } : parse(yaml);

const throwing: FrontmatterChange<never> = () => {
  throw new Error("bug");
};

const textOf = <A extends { readonly text: string }, E>(result: Result.Result<A, E>): string => {
  if (Result.isFailure(result)) throw new Error("the update failed");
  return result.success.text;
};

describe("updateNoteText", () => {
  it("changes only the line of the key the change sets and returns the note as written", () => {
    const seen: Frontmatter[] = [];
    const result = updateNoteText(
      REVIEWED,
      (current) => {
        seen.push(current);
        return Result.succeed({ set: { kind: "Haus" } });
      },
      parse,
    );
    const current = {
      plz: 1067,
      version: 1.1,
      iban_nr: 12345678901234567000,
      flow: ["a", "b"],
      quoted: "yes",
      schema: "weg-manager.community/v1",
      name: "Ahornweg 12",
      kind: "WEG",
    };
    expect(seen).toEqual([current]);
    expect(result).toEqual(
      Result.succeed({
        text: REVIEWED.replace("kind: WEG", "kind: Haus"),
        frontmatter: { ...current, kind: "Haus" },
      }),
    );
  });

  it("saves a note that starts with a BOM, and keeps the BOM and CRLF", () => {
    const text = `${BOM}---\r\nschema: x\r\nkind: WEG\r\n---\r\nBody\r\n`;
    expect(textOf(updateNoteText(text, setting({ kind: "Haus" }), parse))).toBe(
      `${BOM}---\r\nschema: x\r\nkind: Haus\r\n---\r\nBody\r\n`,
    );
  });

  it("hands the change {} for a note without frontmatter or with an empty block", () => {
    for (const text of ["# Plain\n", "", "---\n---\nbody\n", "---\n# only a comment\n---\n"]) {
      const change = vi.fn<FrontmatterChange<never>>(() => Result.succeed({}));
      expect(textOf(updateNoteText(text, change, parse))).toBe(text);
      expect(change.mock.calls).toEqual([[{}]]);
    }
  });

  it("writes nothing new for keys set to the value they have, or removed while absent", () => {
    const text = '---\nname: "Ahornweg 12"\ntags: [a, b]\n---\n';
    const result = updateNoteText(
      text,
      setting({ name: "Ahornweg 12", tags: ["a", "b"] }, ["gone"]),
      parse,
    );
    expect(result).toEqual(
      Result.succeed({ text, frontmatter: { name: "Ahornweg 12", tags: ["a", "b"] } }),
    );
  });

  it("leaves a note it could not edit alone when nothing changes, instead of refusing", () => {
    const text = "---\n{a: 1}\n---\n";
    expect(updateNoteText(text, setting({ a: 1 }), parse)).toEqual(
      Result.succeed({ text, frontmatter: { a: 1 } }),
    );
  });

  it("removes the keys the patch names and no other", () => {
    expect(textOf(updateNoteText("---\na: 1\nb: 2\n---\n", setting({}, ["b"]), parse))).toBe(
      "---\na: 1\n---\n",
    );
    expect(
      textOf(updateNoteText("---\na: 1\n---\n", () => Result.succeed({ set: { b: 2 } }), parse)),
    ).toBe("---\na: 1\nb: 2\n---\n");
  });

  it("writes a key that is set and removed, as the patch defines", () => {
    expect(textOf(updateNoteText("---\na: 1\n---\n", setting({ a: 2 }, ["a"]), parse))).toBe(
      "---\na: 2\n---\n",
    );
  });

  it("fails with the change's failure and never edits", () => {
    const result = updateNoteText(REVIEWED, () => Result.fail("conflict" as const), parse);
    expect(result).toEqual(Result.fail("conflict"));
  });

  it.each([
    ["broken YAML", "---\nschema: [unclosed\n---\nbody\n"],
    ["duplicate keys", "---\na: 1\na: 2\n---\n"],
    ["YAML that is a list", "---\n- a\n- b\n---\n"],
    ["YAML that is text", "---\njust text\n---\n"],
  ])("fails with NoteUnreadableError for %s and never asks the change", (_, text) => {
    const change = vi.fn<FrontmatterChange<never>>(() => Result.succeed({ set: { a: 1 } }));
    const result = updateNoteText(text, change, parse);
    expect(Result.isFailure(result) && result.failure).toBeInstanceOf(NoteUnreadableError);
    expect(change).not.toHaveBeenCalled();
  });

  it("refuses a note closed by a line it does not write into, and never asks the change", () => {
    const change = vi.fn<FrontmatterChange<never>>(() => Result.succeed({ set: { a: 2 } }));
    for (const closing of ["-----", "--- x", "---- "]) {
      expect(updateNoteText(`---\na: 1\n${closing}\nbody\n`, change, parse)).toEqual(
        Result.fail(new NoteWriteRefusedError({ reason: "layout" })),
      );
    }
    expect(change).not.toHaveBeenCalled();
  });

  it.each(["--- ", "---\t", "----"])(
    "writes into a note closed by %j and keeps that line",
    (closing) => {
      const text = `---\na: 1\n${closing}\r\nbody\n`;
      expect(updateNoteText(text, setting({ a: 2 }), parse)).toEqual(
        Result.succeed({ text: `---\na: 2\n${closing}\r\nbody\n`, frontmatter: { a: 2 } }),
      );
    },
  );

  it("keeps a line's comment behind the new value, also before a block list YAML reads back", () => {
    const text = "---\nkind: WEG # Art\ntags: [a] # Liste\n---\n";
    expect(updateNoteText(text, setting({ kind: "Haus", tags: ["x", "z"] }), parse)).toEqual(
      Result.succeed({
        text: "---\nkind: Haus # Art\ntags: # Liste\n  - x\n  - z\n---\n",
        frontmatter: { kind: "Haus", tags: ["x", "z"] },
      }),
    );
  });

  it("refuses an edit the line scanner cannot place", () => {
    expect(updateNoteText("---\n{a: 1}\n---\n", setting({ a: 2 }), parse)).toEqual(
      Result.fail(new NoteWriteRefusedError({ reason: "layout" })),
    );
  });

  it("refuses an edit after which YAML no longer reads the note", () => {
    // The alias points at the anchor on the line the edit replaces.
    const text = "---\na: &x 1\nb: *x\n---\n";
    expect(updateNoteText(text, setting({ a: 2 }), parse)).toEqual(
      Result.fail(new NoteWriteRefusedError({ reason: "layout" })),
    );
  });

  it.each([
    ["an unpatched key", (yaml: string) => ({ ...(parse(yaml) as object), b: 9 })],
    ["the patched key", (yaml: string) => ({ ...(parse(yaml) as object), a: 9 })],
    ["the key order", (yaml: string) => ({ b: 2, ...(parse(yaml) as object) })],
    ["the kind of document", () => ["a"]],
    ["an empty document", () => null],
  ])("refuses an edit after which YAML reads another value of %s", (_, after) => {
    const parser = (yaml: string): unknown => (yaml.includes("a: 3") ? after(yaml) : parse(yaml));
    expect(updateNoteText("---\na: 1\nb: 2\n---\n", setting({ a: 3 }), parser)).toEqual(
      Result.fail(new NoteWriteRefusedError({ reason: "layout" })),
    );
  });

  it("refuses an edit after which YAML reads a list as a map with the same entries", () => {
    expect(updateNoteText("---\na: 1\nb: 2\n---\n", setting({ a: [3] }), listAsMap)).toEqual(
      Result.fail(new NoteWriteRefusedError({ reason: "layout" })),
    );
  });

  it("refuses an edit when parsing the edited YAML throws", () => {
    expect(updateNoteText("---\na: 1\n---\n", setting({ a: 3 }), failingOnEdit)).toEqual(
      Result.fail(new NoteWriteRefusedError({ reason: "layout" })),
    );
  });

  it("removes the block when the last key goes", () => {
    expect(textOf(updateNoteText("---\nk: v\n---\nbody\n", setting({}, ["k"]), parse))).toBe(
      "body\n",
    );
  });

  it("lets a throw of the change reach the caller", () => {
    expect(() => updateNoteText(REVIEWED, throwing, parse)).toThrow("bug");
  });
});

/** The forms of entry YAML does not let a comment follow on the key line. */
const UNCOMMENTED = new Set([5, 12]);

/**
 * The comment at the end of an entry's key line, with the blanks before it: form 5's own, or
 * `blanks` and a text of the key's own; none without `blanks` or where a comment cannot go.
 */
const commentOf = (key: string, form: number, blanks: string): string => {
  if (form === 5) return ` # a date of ${key}`;
  return blanks === "" || UNCOMMENTED.has(form) ? "" : `${blanks}# über ${key}`;
};

/** One top-level entry of a generated note, as people and agents write them. */
const entryForm = (key: string, form: number): string =>
  [
    `${key}: 01067`,
    `${key}: 1.10`,
    `${key}: 'yes'`,
    `${key}: "quoted # not a comment"`,
    `${key}: [a, b]`,
    `${key}: 2024-01-01 # a date of ${key}`,
    `${key}:`,
    `${key}:\n  - a\n\n  - "b"`,
    `${key}:\n- x\n- 12:30`,
    `${key}: |\n  line 1\n\n  line 3`,
    `${key}: >-\n  folded\n  text`,
    `"${key}": plain value`,
    `${key}: first\n  second`,
    `'${key}'  : ~`,
  ][form] ?? `${key}: x`;

/** The entry of `form`, with the comment of `commentOf` at the end of its key line. */
const entryText = (key: string, form: number, blanks: string): string => {
  const [first, ...rest] = entryForm(key, form).split("\n");
  const comment = form === 5 ? "" : commentOf(key, form, blanks);
  return [`${first}${comment}`, ...rest].join("\n");
};

const KEYS = ["a", "b", "c", "d", "e", "f"];
const NEW_KEYS = ["n1", "n2", "short_code"];

const scalar: Arbitrary<unknown> = oneof(
  string({ unit: "binary" }),
  constantFrom("01067", "yes", "~", "a: b", " x ", "#", "2024-01-01", ""),
  double(),
  boolean(),
  constant(null),
);
const value: Arbitrary<unknown> = oneof(scalar, array(scalar, { maxLength: 3 }));

const generated = record({
  entries: uniqueArray(
    tuple(
      constantFrom(...KEYS),
      constantFrom(...Array(15).keys()),
      constantFrom("", " ", "   ", "\t "),
    ),
    { selector: ([key]) => key, maxLength: KEYS.length },
  ),
  comments: array(constantFrom("# note", "", "#"), { maxLength: 3 }),
  eol: constantFrom("\n", "\r\n"),
  bom: constantFrom("", BOM),
  body: string({ unit: "binary" }),
  set: subarray([...KEYS, ...NEW_KEYS]).chain((keys) =>
    tuple(...keys.map((key) => tuple(constant(key), value))),
  ),
  remove: subarray(KEYS),
});

/** Ordered and exact (`Object.is`) equality of parsed YAML. */
const same = (a: unknown, b: unknown): boolean => {
  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return Object.is(a, b);
  }
  const keys = Object.keys(a);
  return (
    Array.isArray(a) === Array.isArray(b) &&
    JSON.stringify(keys) === JSON.stringify(Object.keys(b)) &&
    keys.every((key) => same(Reflect.get(a, key), Reflect.get(b, key)))
  );
};

/**
 * Each run parses YAML three times; 400 runs take about a second alone. The explicit timeout is for
 * a loaded machine (the gate beside an e2e run), where the default 5 s was once not enough.
 */
const GENERATED_NOTES = 400;

describe("updateNoteText on generated notes", () => {
  it("keeps every byte outside the patched keys and writes exactly the patch", () => {
    assert(
      property(generated, ({ entries, comments, eol, bom, body, set, remove }) => {
        const blocks = entries.map(([key, form, blanks]) => entryText(key, form, blanks));
        const lines = [
          ...comments,
          ...blocks.flatMap((block, index) => [block, comments[index] ?? "#"]),
        ];
        const yaml = lines.map((line) => `${line}\n`).join("");
        const text = `${bom}---\n${yaml}---\n${body}`.replaceAll("\n", eol);
        const before = (parse(yaml) ?? {}) as Record<string, unknown>;
        const patch = { set: Object.fromEntries(set), remove };
        const result = updateNoteText(text, () => Result.succeed(patch), parse);
        if (Result.isFailure(result)) throw new Error("a generated note was refused");
        const written = result.success.text;
        const expected = structuredClone(before);
        applyPatch(expected, patch);
        expect(same(result.success.frontmatter, expected)).toBe(true);
        expect(written.startsWith(`${bom}---${eol}`)).toBe(true);
        const close = written.indexOf(`${eol}---${eol}`, 3);
        const head = written.slice(bom.length, close + eol.length);
        expect(same(parse(head.slice(3 + eol.length)) ?? {}, expected)).toBe(true);
        expect(written.slice(close + 2 * eol.length + 3)).toBe(body.replaceAll("\n", eol));
        expect(head.replaceAll(eol, "").includes("\r")).toBe(false);
        expect(head.split(eol).length).toBe(head.split("\n").length);
        const untouched = entries.filter(
          ([key]) => !Object.hasOwn(patch.set, key) && !remove.includes(key),
        );
        let from = 0;
        for (const [key, form, blanks] of untouched) {
          const at = written.indexOf(entryText(key, form, blanks).replaceAll("\n", eol), from);
          expect(at).toBeGreaterThanOrEqual(from);
          from = at;
        }
        // A key that is set keeps its line's comment at the end of that line, rewritten behind the
        // new value (`key: …`) or kept as it was (a value that did not change); a removed one
        // takes it along.
        const headLines = head.split(eol);
        for (const [key, form, blanks] of entries) {
          const comment = commentOf(key, form, blanks);
          if (comment === "") continue;
          const lines = headLines.filter((line) => line.includes(comment));
          if (Object.hasOwn(patch.set, key)) {
            const [first] = entryText(key, form, blanks).split("\n");
            expect(lines).toHaveLength(1);
            expect(lines[0]?.endsWith(comment)).toBe(true);
            expect(lines[0]?.startsWith(`${key}:`) === true || lines[0] === first).toBe(true);
          } else if (remove.includes(key)) {
            expect(lines).toEqual([]);
          }
        }
      }),
      { numRuns: GENERATED_NOTES },
    );
  }, 30_000);
});
