import { Schema } from "effect";
import { describe, expect, it } from "vitest";
import {
  defineNoteType,
  editedValues,
  lineOfText,
  required,
  text,
  trimmedValues,
  type FormInput,
} from "../../../../src/domain/notes";

/** A small type with text fields of each sort: a line, a pattern, free text. */
const sampleType = defineNoteType({
  type: "sample",
  version: 1,
  fields: {
    title: required(text({ schema: lineOfText(20), issue: "title.invalid" })),
    code: required(
      text({ schema: Schema.String.check(Schema.isPattern(/^[A-Z]{2}$/)), issue: "code.invalid" }),
    ),
    note: text(),
  },
  migrations: {},
});
type SampleInput = FormInput<typeof sampleType.fields>;

const INPUT: SampleInput = { title: "Ahornweg 12", code: "AW", note: "Hof" };

describe("trimmedValues: what a form saves of its text", () => {
  it("trims every field", () => {
    expect(trimmedValues({ title: "  Ahornweg 12 ", code: " AW", note: "Hof\t" })).toEqual(INPUT);
  });

  it("leaves a blank field unset", () => {
    expect(trimmedValues({ title: " ", code: "", note: "\t" })).toEqual({
      title: undefined,
      code: undefined,
      note: undefined,
    });
  });
});

describe("editedValues: what an edit saves", () => {
  const LOADED = {
    schema: "weg-manager.sample/v1",
    id: "sample-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21",
    title: "Ahornweg 12 ",
    code: "AW",
    note: " Hof",
  };
  const edited = (input: SampleInput, loaded: Record<string, unknown> = LOADED) =>
    editedValues(sampleType, input, trimmedValues(input), loaded);

  it("keeps a valid field as written while its input is the loaded text", () => {
    const input = { ...INPUT, title: "Ahornweg 12 ", note: "Garten " };
    expect(edited(input)).toEqual({ ...INPUT, title: "Ahornweg 12 ", note: "Garten" });
  });

  it("makes every changed field what the form saves", () => {
    const input = { ...INPUT, title: " Ahornweg 14 ", note: " Hof " };
    expect(edited(input)).toEqual({ ...INPUT, title: "Ahornweg 14" });
  });

  it("repairs a broken field even when its input is the loaded text", () => {
    const loaded = { ...LOADED, code: "aw", title: "  " };
    const input = { ...INPUT, code: "aw", title: "  " };
    expect(edited(input, loaded)).toEqual({ ...INPUT, code: "aw", title: undefined });
  });

  it("reads a value of another kind as no text to keep", () => {
    expect(edited({ ...INPUT, note: "12" }, { ...LOADED, note: 12 })).toEqual({
      ...INPUT,
      note: "12",
    });
  });

  it("gives every declared field, and only those", () => {
    expect(Object.keys(edited(INPUT, { ...LOADED, other: "x" }))).toEqual([
      "title",
      "code",
      "note",
    ]);
  });
});
