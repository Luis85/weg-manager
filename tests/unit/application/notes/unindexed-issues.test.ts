import { describe, expect, it } from "vitest";
import { de, en } from "../../../../src/application/messages";
import { describeUnindexedIssue } from "../../../../src/application/notes";
import type { UnindexedIssue } from "../../../../src/domain/notes";

const ISSUES: readonly UnindexedIssue[] = [
  { code: "schema.malformed" },
  { code: "schema.unknown-type", type: "meeting" },
  { code: "frontmatter.unreadable" },
];

/** The catalog is product copy: a change here is a deliberate wording change. */
describe("describeUnindexedIssue", () => {
  it("has exact German texts, the unknown type in its sentence", () => {
    expect(ISSUES.map((issue) => describeUnindexedIssue(issue, de.notes))).toEqual([
      "Die Eigenschaft „schema“ ist falsch geschrieben, deshalb kann WEG Manager die Notiz keinem Typ zuordnen. Öffne die Notiz und korrigiere „schema“.",
      "Die Notiz ist als Typ „meeting“ markiert, den diese Version von WEG Manager nicht kennt. Aktualisiere WEG Manager oder korrigiere „schema“ in Obsidian.",
      "Die Eigenschaften oben in der Notiz sind fehlerhaft geschrieben, deshalb kann WEG Manager sie nicht lesen. Öffne die Notiz und korrigiere die Eigenschaften.",
    ]);
  });

  it("has exact English texts", () => {
    expect(ISSUES.map((issue) => describeUnindexedIssue(issue, en.notes))).toEqual([
      "The schema property is malformed, so WEG Manager can't tell the note's type. Open the note and fix its schema property.",
      "The note is marked as type “meeting”, which this version of WEG Manager doesn't know. Update WEG Manager or fix the schema property in Obsidian.",
      "The properties at the top of the note are malformed, so WEG Manager can't read them. Open the note and fix its properties.",
    ]);
  });
});
