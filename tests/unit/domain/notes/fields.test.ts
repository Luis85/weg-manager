import { Option, Schema } from "effect";
import { describe, expect, it } from "vitest";
import {
  checkbox,
  date,
  isCalendarDate,
  list,
  number,
  required,
  text,
  type FieldDeclaration,
} from "../../../../src/domain/notes/fields";

const REJECTED = Symbol("rejected");

/** Each value as the field reads it, or `REJECTED`. */
const read = (field: FieldDeclaration, values: readonly unknown[]) =>
  values.map((value) =>
    Option.getOrElse(Schema.decodeUnknownOption(field.schema)(value), () => REJECTED),
  );

/** What the field makes of `accepted` and `rejected`, and what it should: the first as they are. */
const reading = (
  field: FieldDeclaration,
  accepted: readonly unknown[],
  rejected: readonly unknown[],
) => ({
  actual: read(field, [...accepted, ...rejected]),
  expected: [...accepted, ...rejected.map(() => REJECTED)],
});

describe("field kinds", () => {
  it("declares each kind with its own issue code, optional by default", () => {
    expect(
      [text(), number(), checkbox(), date(), list()].map(
        ({ kind, issue, required: isRequired }) => ({
          kind,
          issue,
          required: isRequired,
        }),
      ),
    ).toEqual([
      { kind: "text", issue: "field.text", required: false },
      { kind: "number", issue: "field.number", required: false },
      { kind: "checkbox", issue: "field.checkbox", required: false },
      { kind: "date", issue: "field.date", required: false },
      { kind: "list", issue: "field.list", required: false },
    ]);
  });

  it("reads text", () => {
    const { actual, expected } = reading(text(), ["", "Ahornweg 12", " x "], [1, true, ["a"], {}]);
    expect(actual).toEqual(expected);
  });

  it("reads finite numbers", () => {
    const { actual, expected } = reading(
      number(),
      [0, -1, 1.5, 1e3],
      ["1", Number.NaN, Infinity, true, [1]],
    );
    expect(actual).toEqual(expected);
  });

  it("reads checkboxes", () => {
    const { actual, expected } = reading(checkbox(), [true, false], ["true", 0, 1]);
    expect(actual).toEqual(expected);
  });

  it("reads dates as YYYY-MM-DD text", () => {
    const { actual, expected } = reading(
      date(),
      ["2026-11-21", "2024-02-29", "0001-01-01"],
      [
        "2026-02-30",
        "2025-02-29",
        "2026-13-01",
        "2026-1-5",
        "2026-11-21T10:00",
        "21.11.2026",
        "",
        20_261_121,
      ],
    );
    expect(actual).toEqual(expected);
  });

  it("reads lists of text", () => {
    const { actual, expected } = reading(
      list(),
      [[], ["a"], ["a", "b"]],
      ["a", [1], ["a", 2], [["a"]], null],
    );
    expect(actual).toEqual(expected);
  });

  it("marks a field required", () => {
    const field = required(text());
    expect(field.required).toBe(true);
    expect(field.issue).toBe("field.text");
    expect(field.kind).toBe("text");
  });

  it("takes a narrower schema with its own issue code", () => {
    const shortCode = text({
      schema: Schema.String.check(Schema.isMaxLength(5)),
      issue: "short-code.length",
    });
    expect(shortCode.issue).toBe("short-code.length");
    const short = reading(shortCode, ["AW"], ["TOO LONG"]);
    expect(short.actual).toEqual(short.expected);
    const color = text({ schema: Schema.Literals(["teal", "red"]) });
    expect(color.issue).toBe("field.text");
    const colors = reading(color, ["teal"], ["blue"]);
    expect(colors.actual).toEqual(colors.expected);
  });
});

describe("isCalendarDate", () => {
  it("is true only for a real calendar day in YYYY-MM-DD", () => {
    expect(isCalendarDate("2026-11-21")).toBe(true);
    expect(isCalendarDate("2026-02-30")).toBe(false);
    expect(isCalendarDate("2026-11-21 ")).toBe(false);
    expect(isCalendarDate("x")).toBe(false);
  });
});
