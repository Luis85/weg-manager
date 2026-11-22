import { anything, assert, dictionary, property, string } from "fast-check";
import { describe, expect, it } from "vitest";
import { de, en } from "../../../../src/application/messages";
import { describeNoteIssue } from "../../../../src/application/notes";
import type { MissingReference, NoteIssue } from "../../../../src/domain/notes";
import { FULL, TEST_ID, testItem } from "../../../support/notes/test-note-type";

const ISSUES: readonly (NoteIssue | MissingReference)[] = [
  { code: "schema.malformed" },
  { code: "schema.newer", version: 4 },
  { code: "migration.failed", from: 2 },
  { code: "id.missing" },
  { code: "id.malformed" },
  { code: "id.other-type" },
  { code: "id.duplicate", other: "Notizen/Kopie.md" },
  { code: "field.missing", key: "title" },
  { code: "field.text", key: "title" },
  { code: "field.number", key: "count" },
  { code: "field.checkbox", key: "done" },
  { code: "field.date", key: "due" },
  { code: "field.list", key: "tags" },
  { code: "field.reference", key: "item_id" },
  { code: "field.references", key: "item_ids" },
  { code: "reference.missing", key: "item_ids", id: TEST_ID },
];

const LABELS: Readonly<Record<string, string>> = {
  title: "Name",
  count: "Anzahl",
  done: "Erledigt",
  due: "Fällig",
  tags: "Schlagwörter",
  item_id: "Punkt",
  item_ids: "Punkte",
};

const label = (key: string): string => LABELS[key] ?? key;

const ENGLISH: Readonly<Record<string, string>> = { title: "Name", count: "Count" };

const english = (key: string): string => ENGLISH[key] ?? key;

/** The catalog is product copy: a change here is a deliberate wording change. */
describe("describeNoteIssue", () => {
  it("has exact German texts, a field's label in its sentence", () => {
    expect(ISSUES.map((issue) => describeNoteIssue(issue, de.notes, label))).toEqual([
      "Die Eigenschaft „schema“ ist falsch geschrieben, deshalb ist die Notiz schreibgeschützt. Öffne die Notiz und korrigiere „schema“.",
      "Die Notiz wurde mit einer neueren Version von WEG Manager gespeichert, etwa auf einem anderen Gerät, deshalb ist sie hier schreibgeschützt. Aktualisiere WEG Manager, um sie zu bearbeiten.",
      "Die Notiz ließ sich nicht auf die aktuelle Version umstellen, deshalb ist sie schreibgeschützt. Öffne die Notiz und prüfe ihre Eigenschaften.",
      "Die Notiz hat keine Eigenschaft „id“, deshalb ist sie schreibgeschützt. Stelle die „id“ in Obsidian wieder her, etwa aus einer Sicherung.",
      "Die Eigenschaft „id“ der Notiz ist ungültig, deshalb ist sie schreibgeschützt. Stelle die ursprüngliche „id“ in Obsidian wieder her.",
      "Die „id“ der Notiz gehört zu einem anderen Typ, deshalb ist sie schreibgeschützt. Prüfe „schema“ und „id“ in Obsidian.",
      "Die Notiz „Notizen/Kopie.md“ hat dieselbe „id“, deshalb sind beide schreibgeschützt. Lösche die doppelte Notiz in Obsidian.",
      "„Name“ fehlt. Gib einen Wert ein.",
      "„Name“ ist kein Text. Gib einen Text ein.",
      "„Anzahl“ ist keine Zahl. Gib eine Zahl ein.",
      "„Erledigt“ ist kein Ja-oder-Nein-Wert. Setze das Häkchen oder entferne es.",
      "„Fällig“ ist kein gültiges Datum. Gib ein Datum im Format JJJJ-MM-TT ein.",
      "„Schlagwörter“ ist keine Liste von Texten. Gib eine Liste ein.",
      "„Punkt“ ist kein gültiger Verweis auf einen Datensatz. Wähle den Datensatz neu aus.",
      "„Punkte“ enthält einen ungültigen Verweis auf einen Datensatz. Wähle die Datensätze neu aus.",
      `„Punkte“ verweist auf einen Datensatz, den es nicht gibt („${TEST_ID}“). Stelle seine Notiz wieder her oder entferne den Verweis.`,
    ]);
  });

  it("has exact English texts", () => {
    expect(ISSUES.map((issue) => describeNoteIssue(issue, en.notes, english))).toEqual([
      "The schema property is malformed, so the note is read-only. Open the note and fix its schema property.",
      "The note was saved by a newer version of WEG Manager, for example on another device, so it's read-only here. Update WEG Manager to edit it.",
      "The note couldn't be converted to the current version, so it's read-only. Open the note and check its properties.",
      "The note has no id property, so it's read-only. Restore the id in Obsidian, for example from a backup.",
      "The note's id property isn't valid, so it's read-only. Restore the original id in Obsidian.",
      "The note's id belongs to another type, so it's read-only. Check schema and id in Obsidian.",
      "The note “Notizen/Kopie.md” has the same id, so both are read-only. Delete the duplicate note in Obsidian.",
      "“Name” is missing. Enter a value.",
      "“Name” isn't text. Enter text.",
      "“Count” isn't a number. Enter a number.",
      "“done” isn't a checkbox value. Check or uncheck it.",
      "“due” isn't a valid date. Enter a date as YYYY-MM-DD.",
      "“tags” isn't a list of text. Enter a list.",
      "“item_id” isn't a valid reference to a record. Choose the record again.",
      "“item_ids” holds a reference to a record that isn't valid. Choose the records again.",
      `“item_ids” refers to a record that doesn't exist (“${TEST_ID}”). Restore its note or remove the reference.`,
    ]);
  });

  it("asks for the label of the issue's own key", () => {
    const asked: string[] = [];
    const recording = (key: string) => {
      asked.push(key);
      return key;
    };
    for (const issue of ISSUES) describeNoteIssue(issue, de.notes, recording);
    expect(asked).toEqual([
      "title",
      "title",
      "count",
      "done",
      "due",
      "tags",
      "item_id",
      "item_ids",
      "item_ids",
    ]);
  });

  it.each([de, en])("never words note content ($shell.language)", (messages) => {
    expect.hasAssertions();
    assert(
      property(
        dictionary(string(), anything()),
        string().map((text) => `⟦${text}⟧`),
        (extra, content) => {
          const frontmatter = {
            ...extra,
            schema: FULL.schema,
            id: `${content}-x`,
            title: [content],
            count: content,
            due: content,
            tags: content,
          };
          const decoded = testItem.decode({ path: `${content}.md`, frontmatter });
          if (decoded.kind === "not-this-type") return;
          for (const issue of decoded.issues) {
            expect(describeNoteIssue(issue as NoteIssue, messages.notes, () => "L")).not.toContain(
              content,
            );
          }
        },
      ),
    );
  });
});
