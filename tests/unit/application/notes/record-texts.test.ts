import { describe, expect, it } from "vitest";
import { de, en } from "../../../../src/application/messages";
import { describeRecordIssue, type RecordTexts } from "../../../../src/application/notes";
import type { RecordIssue } from "../../../../src/domain/notes";

/** A feature's issues: a plain code, one with data, and a field kind's code. */
type SampleIssue =
  | { readonly key: "title" | "code"; readonly code: "field.missing" | "title.invalid" }
  | { readonly key: "code"; readonly code: "code.taken"; readonly other: string }
  | { readonly key: "note"; readonly code: "field.text" };

const TEXTS: RecordTexts<SampleIssue> = {
  fields: { title: "Titel", code: "Kennung", note: "Notiz" },
  missing: { title: "Gib einen Titel ein." },
  issues: {
    "title.invalid": (_, label) => `„${label}“ passt nicht.`,
    "code.taken": ({ other }, label) => `${label} hat schon „${other}“.`,
  },
};

const wordOf = (issue: RecordIssue | SampleIssue) => describeRecordIssue(issue, de.notes, TEXTS);

describe("describeRecordIssue", () => {
  it("words a feature's codes with the issue's data and the field's label", () => {
    expect(wordOf({ key: "title", code: "title.invalid" })).toBe("„Titel“ passt nicht.");
    expect(wordOf({ key: "code", code: "code.taken", other: "Akte 2" })).toBe(
      "Kennung hat schon „Akte 2“.",
    );
  });

  it("asks for a missing field in the feature's words, else in the notes catalog's", () => {
    expect(wordOf({ key: "title", code: "field.missing" })).toBe("Gib einen Titel ein.");
    expect(wordOf({ key: "code", code: "field.missing" })).toBe(
      "„Kennung“ fehlt. Gib einen Wert ein.",
    );
  });

  it("words a field kind's code and an issue of the note as a whole as the notes catalog does", () => {
    expect(wordOf({ key: "note", code: "field.text" })).toBe(
      "„Notiz“ ist kein Text. Gib einen Text ein.",
    );
    expect(wordOf({ code: "schema.newer", version: 2 })).toBe(
      de.notes.recordIssues["schema.newer"]({ code: "schema.newer", version: 2 }),
    );
    expect(describeRecordIssue({ code: "id.missing" }, en.notes, TEXTS)).toBe(
      en.notes.recordIssues["id.missing"]({ code: "id.missing" }),
    );
  });
});

/** The catalog is product copy: a change here is a deliberate wording change. */
describe("the notes catalog's record texts", () => {
  it("has exact German texts", () => {
    const { notices } = de.notes;
    expect([notices.created("A"), notices.saved("A"), notices.deleted("A")]).toEqual([
      "„A“ angelegt",
      "„A“ gespeichert",
      "„A“ in den Papierkorb verschoben",
    ]);
  });

  it("has exact English texts", () => {
    const { notices } = en.notes;
    expect([notices.created("A"), notices.saved("A"), notices.deleted("A")]).toEqual([
      "“A” created",
      "“A” saved",
      "“A” moved to the trash",
    ]);
  });
});
