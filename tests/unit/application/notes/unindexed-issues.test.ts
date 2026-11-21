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
      "Die Eigenschaft „schema“ ist nicht lesbar, deshalb kann WEG Manager die Notiz keinem Typ zuordnen. Korrigiere sie in Obsidian nach dem Dateivertrag.",
      "Die Notiz ist als Typ „meeting“ markiert, den diese Version von WEG Manager nicht kennt. Aktualisiere WEG Manager oder korrigiere „schema“ in Obsidian.",
      "Die Eigenschaften der Notiz sind kein gültiges YAML, deshalb kann WEG Manager sie nicht lesen. Korrigiere sie in Obsidian.",
    ]);
  });

  it("has exact English texts", () => {
    expect(ISSUES.map((issue) => describeUnindexedIssue(issue, en.notes))).toEqual([
      "The schema property can't be read, so WEG Manager can't tell the note's type. Fix it in Obsidian as the file contract describes.",
      "The note is marked as type “meeting”, which this version of WEG Manager doesn't know. Update WEG Manager or fix the schema property in Obsidian.",
      "The note's properties aren't valid YAML, so WEG Manager can't read them. Fix them in Obsidian.",
    ]);
  });
});
