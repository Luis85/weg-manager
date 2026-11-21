import { describe, expect, it } from "vitest";
import { FULL_VALUES, testItem } from "../../../support/notes/test-note-type";

/** PBI-53 left this open for the first form: form values checked against the field rules. */
describe("check: form values against a note type's field rules", () => {
  it("finds nothing wrong with valid values", () => {
    expect(testItem.check(FULL_VALUES)).toEqual([]);
  });

  it("names a missing required field and leaves missing optional ones alone", () => {
    expect(testItem.check({ count: 4 })).toEqual([{ code: "field.missing", key: "title" }]);
    expect(testItem.check({ title: null })).toEqual([{ code: "field.missing", key: "title" }]);
  });

  it("names each rejected value with its kind's code or the declaration's own", () => {
    expect(
      testItem.check({
        title: 1,
        short_code: "TOOLONG",
        count: "4",
        done: "yes",
        due: "2026-02-30",
        tags: "a",
      }),
    ).toEqual([
      { code: "field.text", key: "title" },
      { code: "short-code.length", key: "short_code" },
      { code: "field.number", key: "count" },
      { code: "field.checkbox", key: "done" },
      { code: "field.date", key: "due" },
      { code: "field.list", key: "tags" },
    ]);
  });

  it("ignores keys the type does not declare", () => {
    expect(testItem.check({ title: "T", schema: 1, id: 2, other: [] })).toEqual([]);
  });
});
