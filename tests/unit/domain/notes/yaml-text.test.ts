import {
  array,
  assert,
  boolean,
  constant,
  constantFrom,
  double,
  oneof,
  property,
  string,
  type Arbitrary,
} from "fast-check";
import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { yamlEntry } from "../../../../src/domain/notes/yaml-text";

/** What Obsidian's parser (YAML 1.2, core schema) reads from one written entry. */
const read = (lines: string): unknown => (parse(lines) as Record<string, unknown>)["k"];

/** The same with YAML 1.1, as older tools (PyYAML) read a file an agent edits. */
const read11 = (lines: string): unknown =>
  (parse(lines, { version: "1.1" }) as Record<string, unknown>)["k"];

/** Pieces of text that YAML reads as something else, or that break a line, when written plain. */
const TRICKY = [
  "yes",
  "No",
  "on",
  "OFF",
  "y",
  "null",
  "Null",
  "~",
  "true",
  "FALSE",
  "01067",
  "1.10",
  "12345678901234567890",
  "0x1F",
  "0o17",
  "0b101",
  "1_000",
  "12:30",
  "1e5",
  ".5",
  ".",
  "e5",
  "...",
  ".inf",
  "-.Inf",
  ".NaN",
  "+1",
  "2024-01-01",
  "2024-01-01T10:00:00Z",
  ": ",
  ":",
  " #",
  "#",
  " ",
  "\t",
  "\n",
  "\r",
  "\r\n",
  "'",
  '"',
  "\\",
  "-",
  "- ",
  "?",
  "[",
  "]",
  "{",
  "}",
  ",",
  "&",
  "*",
  "!",
  "|",
  ">",
  "%",
  "@",
  "`",
  "<<",
  "=",
  "---",
  "...",
  "\u0085",
  "\u00a0",
  "\u2028",
  "\u2029",
  "\ufeff",
  "\u007f",
  "\u0000",
  "\u001b",
  "\ufffe",
  "\uffff",
  "\ud800",
  "\udc00",
  "😀",
  "Ä",
  "a",
  "Ahornweg 12",
];

const tricky: Arbitrary<string> = array(
  oneof(constantFrom(...TRICKY), string({ unit: "binary", maxLength: 4 })),
  { maxLength: 6 },
).map((parts) => parts.join(""));

const text: Arbitrary<string> = oneof(tricky, string({ unit: "binary" }), string());

const scalar: Arbitrary<unknown> = oneof(text, double(), boolean(), constant(null));

describe("yamlEntry", () => {
  it.each([
    ["name", "Ahornweg 12", "name: Ahornweg 12\n"],
    ["schema", "weg-manager.community/v1", "schema: weg-manager.community/v1\n"],
    ["date", "2026-01-01", "date: 2026-01-01\n"],
    ["flow", "Haus [B], links", "flow: Haus [B], links\n"],
    ["emoji", "😀 Haus", "emoji: 😀 Haus\n"],
    ["colon", "a:b", "colon: a:b\n"],
    ["hash", "a#b", "hash: a#b\n"],
    ["quote", 'say "hi"', 'quote: say "hi"\n'],
    ["almost a time", "x1:30", "almost a time: x1:30\n"],
    ["a time and a word", "1:30.x", "a time and a word: 1:30.x\n"],
    ["almost inf", "x.inf", "almost inf: x.inf\n"],
    ["almost nan", "x.nan", "almost nan: x.nan\n"],
    ["nan and more", ".nanx", "nan and more: .nanx\n"],
    ["inf and more", ".infx", "inf and more: .infx\n"],
    ["almost an exponent", "1ex5", "almost an exponent: 1ex5\n"],
    ["almost hex", "a0x1F", "almost hex: a0x1F\n"],
    ["hex and more", "0x1Fg", "hex and more: 0x1Fg\n"],
    ["backslash", "back\\slash", "backslash: back\\slash\n"],
  ])("writes %s as plain text where YAML reads it back unchanged", (key, value, line) => {
    expect(yamlEntry(key, value, "\n")).toBe(line);
  });

  it.each([
    ["", '""'],
    ["01067", '"01067"'],
    ["1.10", '"1.10"'],
    ["yes", '"yes"'],
    ["Off", '"Off"'],
    ["~", '"~"'],
    ["null", '"null"'],
    ["true", '"true"'],
    ["12:30", '"12:30"'],
    ["1:30:00", '"1:30:00"'],
    ["1:5", '"1:5"'],
    ["1:30.25", '"1:30.25"'],
    ["1e+5", '"1e+5"'],
    ["1e10", '"1e10"'],
    ["0o17", '"0o17"'],
    ["1_000", '"1_000"'],
    [".inf", '".inf"'],
    [".NaN", '".NaN"'],
    ["0x1F", '"0x1F"'],
    ["0b101", '"0b101"'],
    ["+1", '"+1"'],
    ["1e5", '"1e5"'],
    [".", '"."'],
    ["e0", '"e0"'],
    ["... yes", '"... yes"'],
    ["1.", '"1."'],
    ["<<", '"<<"'],
    ["=", '"="'],
    ["a: b", '"a: b"'],
    ["a:", '"a:"'],
    ["a #b", '"a #b"'],
    [" lead", '" lead"'],
    ["trail ", '"trail "'],
    ["'q'", "\"'q'\""],
    ['"q"', '"\\"q\\""'],
    ["-dash", '"-dash"'],
    ["#x", '"#x"'],
    ["a\tb", '"a\\tb"'],
    ["a\nb", '"a\\nb"'],
    ["a\rb", '"a\\rb"'],
    ["a\u0085b", '"a\\u0085b"'],
    ["a\u2028b", '"a\\u2028b"'],
    ["a\ufeffb", '"a\\ufeffb"'],
    ["a\u007fb", '"a\\u007fb"'],
    ["\ud800", '"\\ud800"'],
    ["a\uffffb", '"a\\uffffb"'],
  ])("quotes %j as %s", (value, written) => {
    expect(yamlEntry("k", value, "\n")).toBe(`k: ${written}\n`);
  });

  it.each([
    [1067, "k: 1067\n"],
    [1.1, "k: 1.1\n"],
    [-0, "k: -0\n"],
    [1e21, "k: 1e+21\n"],
    [Number.NaN, "k: .nan\n"],
    [Infinity, "k: .inf\n"],
    [-Infinity, "k: -.inf\n"],
    [true, "k: true\n"],
    [false, "k: false\n"],
    [null, "k:\n"],
  ])("writes %s as YAML reads it", (value, line) => {
    expect(yamlEntry("k", value, "\n")).toBe(line);
  });

  it("writes a list as Obsidian does, one item per line, and an empty one as []", () => {
    expect(yamlEntry("tags", ["a", "b c", 1, null, "yes"], "\n")).toBe(
      'tags:\n  - a\n  - b c\n  - 1\n  - null\n  - "yes"\n',
    );
    expect(yamlEntry("tags", [], "\n")).toBe("tags: []\n");
  });

  it("ends every line with the line break it is given", () => {
    expect(yamlEntry("tags", ["a", "b"], "\r\n")).toBe("tags:\r\n  - a\r\n  - b\r\n");
    expect(yamlEntry("k", "v", "\r\n")).toBe("k: v\r\n");
  });

  it("quotes a key as it quotes text", () => {
    expect(yamlEntry("a: b", 1, "\n")).toBe('"a: b": 1\n');
    expect(yamlEntry("", 1, "\n")).toBe('"": 1\n');
    expect(yamlEntry("short_code", "AW", "\n")).toBe("short_code: AW\n");
  });

  it.each([
    ["a nested map", { a: 1 }],
    ["a nested list", [[1]]],
    ["a map in a list", [{ a: 1 }]],
    ["undefined", undefined],
    ["a function", () => 1],
    ["a big integer", 1n],
    ["a date object", new Date(0)],
  ])("refuses %s, which no record holds", (_, value) => {
    expect(() => yamlEntry("k", value, "\n")).toThrow("unsupported value");
  });

  it("writes any text, number, boolean or null so that YAML 1.2 reads back exactly that value", () => {
    assert(
      property(scalar, (value) => {
        expect(Object.is(read(yamlEntry("k", value, "\n")), value)).toBe(true);
      }),
      { numRuns: 3000 },
    );
  });

  it("writes text so that YAML 1.1 reads back the same text too, except dates", () => {
    // YAML 1.1 reads `2026-01-01` as a timestamp; Obsidian reads and writes it as plain text.
    const date = /^\d{4}-\d\d?-\d\d?(?:[Tt \t]|$)/;
    assert(
      property(
        text.filter((value) => !date.test(value)),
        (value) => {
          expect(read11(yamlEntry("k", value, "\n"))).toBe(value);
        },
      ),
      { numRuns: 2000 },
    );
  });

  it("writes lists of scalars so that YAML reads back the same list, with CRLF too", () => {
    assert(
      property(array(scalar), constantFrom("\n", "\r\n"), (items, eol) => {
        const back = read(yamlEntry("k", items, eol));
        expect(Array.isArray(back)).toBe(true);
        const list = back as unknown[];
        expect(list.length).toBe(items.length);
        expect(items.every((item, index) => Object.is(list[index], item))).toBe(true);
      }),
      { numRuns: 500 },
    );
  });

  it("writes any key so that YAML reads back exactly that key", () => {
    assert(
      property(
        text.filter((key) => key !== "__proto__"),
        (key) => {
          expect(Object.keys(parse(yamlEntry(key, 1, "\n")) as object)).toEqual([key]);
        },
      ),
      { numRuns: 2000 },
    );
  });
});
