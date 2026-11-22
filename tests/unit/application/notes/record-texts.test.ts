import { describe, expect, it } from "vitest";
import { de, en } from "../../../../src/application/messages";
import {
  describeRecordIssue,
  type NotesCatalog,
  type RecordTexts,
} from "../../../../src/application/notes";
import type { MissingReference, RecordIssue } from "../../../../src/domain/notes";

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

  it("words a missing reference target as the notes catalog does, with the feature's label", () => {
    type LinkIssue =
      MissingReference | { readonly key: "communities"; readonly code: "field.missing" };
    const texts: RecordTexts<LinkIssue> = { fields: { communities: "Gemeinschaften" }, issues: {} };
    const id = "community-3f2b8c1e-7a44-4d0b-9c2e-5b1f0a6d9e21";
    const issue = { code: "reference.missing", key: "communities", id } as const;
    expect(describeRecordIssue(issue, de.notes, texts)).toBe(
      `„Gemeinschaften“ verweist auf einen Datensatz, den es nicht gibt („${id}“). Stelle seine Notiz wieder her oder entferne den Verweis.`,
    );
  });
});

/** The record texts of a notes catalog, its functions called with samples, as plain data. */
const rendered = (notes: NotesCatalog) => ({
  openNote: { label: notes.openNote.label, labelFor: notes.openNote.labelFor("Ahornweg 12") },
  conflict: {
    ...notes.conflict,
    loaded: notes.conflict.loaded("WEG"),
    mine: notes.conflict.mine("Haus"),
    theirs: notes.conflict.theirs("Tiefgarage"),
  },
  deletion: { ...notes.deletion, detail: notes.deletion.detail("Ahornweg 12") },
  dataIssues: {
    ...notes.dataIssues,
    count: [notes.dataIssues.count(1), notes.dataIssues.count(2)],
  },
  notices: {
    created: notes.notices.created("Ahornweg 12"),
    saved: notes.notices.saved("Ahornweg 12"),
    deleted: notes.notices.deleted("Ahornweg 12"),
  },
});

/** The catalog is product copy: a change here is a deliberate wording change. */
describe("the notes catalog's record texts", () => {
  it("has exact German texts", () => {
    expect(rendered(de.notes)).toEqual({
      openNote: { label: "In Obsidian öffnen", labelFor: "Ahornweg 12 in Obsidian öffnen" },
      conflict: {
        title: "Notiz geändert, während du bearbeitet hast",
        detail:
          "Diese Angaben wurden auch außerhalb dieses Formulars geändert, etwa auf einem anderen Gerät. Wähle je Angabe den Wert, der gelten soll, und speichere.",
        loaded: "Beim Öffnen: WEG",
        mine: "Deine Eingabe: Haus",
        theirs: "Jetzt in der Notiz: Tiefgarage",
        apply: "Auswahl speichern",
        empty: "(leer)",
        checked: "Ja",
        unchecked: "Nein",
      },
      deletion: {
        detail:
          "„Ahornweg 12“ wird in Obsidians Papierkorb verschoben. Dort kannst du die Notiz wiederherstellen.",
        confirm: "In den Papierkorb verschieben",
        cancel: "Abbrechen",
      },
      dataIssues: {
        title: "Datenprobleme",
        intro:
          "Hier stehen Notizen von WEG Manager, die das Plugin nicht lesen oder keinem Typ zuordnen kann. Öffne eine Notiz in Obsidian und korrigiere sie dort.",
        loading: "Notizen werden geprüft …",
        none: "Alle Notizen von WEG Manager lassen sich lesen.",
        otherNotes: "Andere Notizen von WEG Manager",
        count: ["1 Notiz", "2 Notizen"],
      },
      notices: {
        created: "„Ahornweg 12“ angelegt",
        saved: "„Ahornweg 12“ gespeichert",
        deleted: "„Ahornweg 12“ in den Papierkorb verschoben",
      },
    });
  });

  it("has exact English texts", () => {
    expect(rendered(en.notes)).toEqual({
      openNote: { label: "Open in Obsidian", labelFor: "Open Ahornweg 12 in Obsidian" },
      conflict: {
        title: "Note changed while you were editing",
        detail:
          "These fields were also changed outside this form, for example on another device. Choose the value to keep for each, then save.",
        loaded: "When you opened it: WEG",
        mine: "Your entry: Haus",
        theirs: "Now in the note: Tiefgarage",
        apply: "Save choice",
        empty: "(empty)",
        checked: "Yes",
        unchecked: "No",
      },
      deletion: {
        detail: "“Ahornweg 12” will be moved to Obsidian's trash, where you can restore it.",
        confirm: "Move to trash",
        cancel: "Cancel",
      },
      dataIssues: {
        title: "Data issues",
        intro:
          "WEG Manager notes the plugin can't read or assign to a type are listed here. Open a note in Obsidian to fix it there.",
        loading: "Checking notes…",
        none: "Every WEG Manager note can be read.",
        otherNotes: "Other WEG Manager notes",
        count: ["1 note", "2 notes"],
      },
      notices: {
        created: "“Ahornweg 12” created",
        saved: "“Ahornweg 12” saved",
        deleted: "“Ahornweg 12” moved to the trash",
      },
    });
  });
});
