import { describe, expect, it } from "vitest";
import { appNoteTypes } from "../../../src/application/note-types";

/** The registry is composition: a type missing here is a note the index never shows. */
describe("appNoteTypes", () => {
  it("registers every feature's note type once", () => {
    expect(appNoteTypes.map((type) => type.type)).toEqual(["community"]);
  });
});
