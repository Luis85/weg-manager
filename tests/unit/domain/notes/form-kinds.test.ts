import { Result } from "effect";
import { describe, expect, it } from "vitest";
import {
  draftValues,
  editedValues,
  formInput,
  fromInput,
  toInput,
  type FormInput,
} from "../../../../src/domain/notes";
import { OTHER_ID, TEST_ID } from "../../../support/notes/test-note-type";
import { recordNote, testRecord } from "../../../support/notes/test-record-type";

type Input = FormInput<typeof testRecord.fields>;

const LOADED = recordNote();
const INPUT: Input = {
  title: "Akte 1",
  due: "2026-11-22",
  count: 5,
  done: true,
  tags: ["rot", "grün"],
  item_id: TEST_ID,
  item_ids: [TEST_ID, OTHER_ID],
};

describe("toInput: a stored value as the form holds it, per field kind", () => {
  it("gives text and dates as text, numbers as numbers, flags as flags, lists as lists", () => {
    expect(formInput(testRecord, LOADED)).toEqual(INPUT);
  });

  it("gives the empty form value of each kind for an unset or empty property", () => {
    const empty = { title: "", due: "", count: undefined, done: false, tags: [], item_id: "" };
    expect(formInput(testRecord, { title: null, item_ids: null })).toEqual({
      ...empty,
      item_ids: [],
    });
  });

  it("shows a value of the wrong kind where the kind can hold it, so a save can repair it", () => {
    expect(toInput("text", 12)).toBe("12");
    expect(toInput("text", true)).toBe("true");
    expect(toInput("text", ["a"])).toBe("");
    expect(toInput("number", "5")).toBeUndefined();
    expect(toInput("checkbox", "true")).toBe(false);
    expect(toInput("list", "rot")).toEqual(["rot"]);
    expect(toInput("list", ["rot", 3, { x: 1 }])).toEqual(["rot", "3"]);
    expect(toInput("references", TEST_ID)).toEqual([TEST_ID]);
    expect(toInput("reference", [TEST_ID])).toBe("");
  });
});

describe("fromInput: what a form saves of a form value, per field kind", () => {
  it("trims text, leaves blank text unset, keeps numbers and flags", () => {
    expect(fromInput("text", "  Akte ")).toBe("Akte");
    expect(fromInput("date", " ")).toBeUndefined();
    expect(fromInput("reference", "")).toBeUndefined();
    expect(fromInput("number", 0)).toBe(0);
    expect(fromInput("number", undefined)).toBeUndefined();
    expect(fromInput("checkbox", false)).toBe(false);
  });

  it("trims list entries, drops blank ones and leaves an empty list unset", () => {
    expect(fromInput("list", [" rot", "", " "])).toEqual(["rot"]);
    expect(fromInput("references", [])).toBeUndefined();
  });

  it("gives every declared field of a form's input", () => {
    expect(draftValues(testRecord, { ...INPUT, title: " Akte 2 ", tags: [] })).toEqual({
      ...INPUT,
      title: "Akte 2",
      tags: undefined,
    });
  });
});

const edited = (input: Input, loaded: Record<string, unknown> = LOADED) =>
  editedValues(testRecord, input, draftValues(testRecord, input), loaded);

describe("editedValues for every field kind", () => {
  it("keeps every untouched field as the note holds it", () => {
    const values = edited({ ...INPUT, title: "Akte 2" });
    expect(values).toEqual({ ...INPUT, title: "Akte 2" });
    for (const key of ["tags", "item_ids"] as const) expect(values[key]).toBe(LOADED[key]);
  });

  it("keeps an unset field unset while its input is the empty value of its kind", () => {
    const loaded = { schema: LOADED.schema, id: LOADED.id, title: "Akte 1" };
    const input = formInput(testRecord, loaded);
    expect(edited({ ...input, title: "Akte 2" }, loaded)).toEqual({
      title: "Akte 2",
      due: undefined,
      count: undefined,
      done: undefined,
      tags: undefined,
      item_id: undefined,
      item_ids: undefined,
    });
  });

  it("saves what the form holds for a field the user changed", () => {
    const input = { ...INPUT, count: 6, done: false, tags: ["rot"], item_ids: [OTHER_ID] };
    expect(edited(input)).toEqual(input);
  });

  it("repairs a broken value of another kind even when it shows unchanged", () => {
    const loaded = recordNote({ count: "5", tags: "rot" });
    const input = formInput(testRecord, loaded);
    expect(edited(input, loaded)).toMatchObject({ count: undefined, tags: ["rot"] });
  });
});

describe("parse: a form's values as the type's values", () => {
  it("gives the values when every field rule holds", () => {
    const values = draftValues(testRecord, INPUT);
    expect(Result.getOrThrow(testRecord.parse(values))).toEqual(INPUT);
  });

  it("names each field that breaks its rule", () => {
    const parsed = testRecord.parse({ ...INPUT, title: undefined, item_id: "community-x" });
    expect(Result.isFailure(parsed) && parsed.failure).toEqual([
      { code: "field.missing", key: "title" },
      { code: "field.reference", key: "item_id" },
    ]);
  });
});
