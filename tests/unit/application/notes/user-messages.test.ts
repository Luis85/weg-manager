import { property, assert as fcAssert, string } from "fast-check";
import { describe, expect, it } from "vitest";
import type { AppError } from "../../../../src/application/errors";
import { de, en } from "../../../../src/application/messages";
import {
  InvalidNoteNameError,
  NoteEditConflictError,
  NoteIndexReadError,
  NoteNotFoundError,
  NotePathTakenError,
  NoteTrashError,
  NoteUnreadableError,
  NoteWriteError,
  NoteWriteRefusedError,
} from "../../../../src/application/notes/errors";
import { describeNotesError } from "../../../../src/application/notes/user-messages";
import type { UserMessage } from "../../../../src/application/shell/user-messages";
import { describeError } from "../../../../src/application/user-messages";

const FORBIDDEN = ["Error", "stack", "/", "\\", ".md"];

const expectPlain = (message: UserMessage, rawCause?: string) => {
  expect(message.title.trim()).not.toBe("");
  expect(message.detail.trim()).not.toBe("");
  for (const text of [message.title, message.detail]) {
    for (const forbidden of FORBIDDEN) expect(text).not.toContain(forbidden);
    if (rawCause !== undefined && rawCause.trim().length > 3) expect(text).not.toContain(rawCause);
  }
};

/** Note content that no catalog text can hold by chance. */
const content = string().map((text) => `⟦${text}⟧`);

const ALL: readonly AppError[] = [
  new NoteNotFoundError(),
  new NotePathTakenError(),
  new InvalidNoteNameError({ issue: "empty" }),
  new InvalidNoteNameError({ issue: "forbidden-character" }),
  new InvalidNoteNameError({ issue: "leading-dot" }),
  new NoteUnreadableError({ cause: null }),
  new NoteWriteError({ cause: null }),
  new NoteTrashError({ cause: null }),
  new NoteEditConflictError({
    conflicts: [{ key: "title", base: "a", edited: "b", current: "c" }],
  }),
  new NoteWriteRefusedError({ reason: "other-type" }),
  new NoteWriteRefusedError({ reason: "newer-version" }),
  new NoteWriteRefusedError({ reason: "identity" }),
  new NoteWriteRefusedError({ reason: "duplicate-id" }),
  new NoteWriteRefusedError({ reason: "migration-failed" }),
  new NoteWriteRefusedError({ reason: "layout" }),
  new NoteIndexReadError(),
];

describe.each([de, en])("describeError for notes ($shell.language)", (messages) => {
  it("hands every notes error to the notes module's describer, with its part of the catalog", () => {
    for (const error of ALL) {
      expect(describeError(error, messages)).toEqual(
        describeNotesError(error as Parameters<typeof describeNotesError>[0], messages.notes),
      );
    }
  });

  it("words every notes error plainly", () => {
    expect.hasAssertions();
    for (const error of ALL) expectPlain(describeError(error, messages));
  });

  it("explains each name issue differently", () => {
    const details = new Set(
      (["empty", "forbidden-character", "leading-dot"] as const).map(
        (issue) => describeError(new InvalidNoteNameError({ issue }), messages).detail,
      ),
    );
    expect(details.size).toBe(3);
  });

  it("explains each write refusal differently", () => {
    const details = new Set(
      (
        [
          "other-type",
          "newer-version",
          "identity",
          "duplicate-id",
          "migration-failed",
          "layout",
        ] as const
      ).map((reason) => describeError(new NoteWriteRefusedError({ reason }), messages).detail),
    );
    expect(details.size).toBe(6);
  });

  it("never words the values of a conflict, nor puts them into the error message", () => {
    expect.hasAssertions();
    fcAssert(
      property(content, content, content, (base, edited, current) => {
        const error = new NoteEditConflictError({
          conflicts: [{ key: "title", base, edited, current }],
        });
        for (const text of [base, edited, current]) {
          expectPlain(describeError(error, messages), text);
          expect(error.message).not.toContain(text);
        }
      }),
    );
  });

  it("never leaks the cause text", () => {
    expect.hasAssertions();
    fcAssert(
      property(content, (text) => {
        for (const error of [
          new NoteWriteError({ cause: new Error(text) }),
          new NoteUnreadableError({ cause: new Error(text) }),
        ]) {
          expectPlain(describeError(error, messages), text);
        }
      }),
    );
  });
});

/** The catalog is product copy: a change here is a deliberate wording change. */
const texts = (messages: typeof de) =>
  ALL.map((error) => {
    const { severity, title, detail, action } = describeError(error, messages);
    return [severity, title, detail, action];
  });

describe("notes message texts", () => {
  it("has exact German texts", () => {
    expect(texts(de)).toEqual([
      [
        "warning",
        "Notiz nicht gefunden",
        "Die Notiz wurde verschoben oder gelöscht. Prüfe, ob sie noch im Vault liegt.",
        undefined,
      ],
      [
        "warning",
        "Name schon vergeben",
        "Im Ordner gibt es schon eine Notiz mit diesem Namen. Wähle einen anderen Namen.",
        undefined,
      ],
      ["warning", "Name nicht möglich", "Der Name ist leer. Gib einen Namen ein.", undefined],
      [
        "warning",
        "Name nicht möglich",
        "Der Name enthält ein Zeichen, das in Dateinamen nicht vorkommen darf, etwa einen Schrägstrich oder Doppelpunkt. Entferne es.",
        undefined,
      ],
      [
        "warning",
        "Name nicht möglich",
        "Der Name beginnt mit einem Punkt, dann blendet Obsidian die Notiz aus. Entferne den Punkt.",
        undefined,
      ],
      [
        "warning",
        "Eigenschaften nicht lesbar",
        "Die Eigenschaften oben in der Notiz sind fehlerhaft geschrieben, deshalb kann WEG Manager sie nicht ändern. Öffne die Notiz, korrigiere die Eigenschaften und speichere dann erneut.",
        undefined,
      ],
      [
        "error",
        "Notiz nicht gespeichert",
        "Obsidian konnte die Notiz nicht schreiben. Versuche es erneut.",
        "retry",
      ],
      [
        "error",
        "Notiz nicht gelöscht",
        "Obsidian konnte die Notiz nicht in den Papierkorb verschieben. Versuche es erneut.",
        "retry",
      ],
      [
        "warning",
        "Notiz geändert, während du bearbeitet hast",
        "Die Notiz wurde auch außerhalb dieses Formulars geändert, in Angaben, die du bearbeitet hast. Wähle je Angabe den Wert, der gelten soll, und speichere erneut.",
        undefined,
      ],
      [
        "warning",
        "Speichern nicht möglich",
        "Die Notiz ist inzwischen kein Datensatz dieses Typs mehr. Prüfe ihre Eigenschaft „schema“ in Obsidian.",
        undefined,
      ],
      [
        "warning",
        "Speichern nicht möglich",
        "Die Notiz wurde inzwischen mit einer neueren Version von WEG Manager gespeichert, etwa auf einem anderen Gerät. Aktualisiere WEG Manager und öffne sie dann erneut.",
        undefined,
      ],
      [
        "warning",
        "Speichern nicht möglich",
        "Die Kennung („id“) der Notiz wurde geändert, sie gehört jetzt zu einem anderen Datensatz. Schließe das Formular und öffne es erneut.",
        undefined,
      ],
      [
        "warning",
        "Speichern nicht möglich",
        "Eine andere Notiz hat dieselbe Kennung („id“), deshalb ist unklar, welche gemeint ist. Lösche die doppelte Notiz in Obsidian und versuche es dann erneut.",
        undefined,
      ],
      [
        "warning",
        "Speichern nicht möglich",
        "Die Notiz ließ sich nicht auf die aktuelle Version umstellen. Öffne die Notiz und prüfe ihre Eigenschaften.",
        undefined,
      ],
      [
        "warning",
        "Speichern nicht möglich",
        "Die Eigenschaften der Notiz sind so geschrieben, dass WEG Manager sie nicht ändern kann, ohne auch andere Zeilen zu ändern. Schreibe in Obsidian jede Eigenschaft als eigene Zeile „schlüssel: wert“ zwischen zwei Zeilen „---“ und speichere dann erneut.",
        undefined,
      ],
      [
        "warning",
        "Notizen nicht gelesen",
        "Obsidian konnte nicht alle Notizen lesen, deshalb ist die Liste vielleicht unvollständig. Versuche es erneut.",
        "retry",
      ],
    ]);
  });

  it("has exact English texts", () => {
    expect(texts(en)).toEqual([
      [
        "warning",
        "Note not found",
        "The note was moved or deleted. Check that it's still in the vault.",
        undefined,
      ],
      [
        "warning",
        "Name already taken",
        "The folder already has a note with this name. Choose another name.",
        undefined,
      ],
      ["warning", "Can't use this name", "The name is empty. Enter a name.", undefined],
      [
        "warning",
        "Can't use this name",
        "The name contains a character that file names can't hold, such as a slash or a colon. Remove it.",
        undefined,
      ],
      [
        "warning",
        "Can't use this name",
        "The name starts with a dot, so Obsidian would hide the note. Remove the dot.",
        undefined,
      ],
      [
        "warning",
        "Can't read properties",
        "The properties at the top of the note are malformed, so WEG Manager can't change them. Open the note, fix its properties, then save again.",
        undefined,
      ],
      ["error", "Note not saved", "Obsidian couldn't write the note. Try again.", "retry"],
      [
        "error",
        "Note not deleted",
        "Obsidian couldn't move the note to the trash. Try again.",
        "retry",
      ],
      [
        "warning",
        "Note changed while you were editing",
        "The note was also changed outside this form, in fields you edited. Choose the value to keep for each, then save again.",
        undefined,
      ],
      [
        "warning",
        "Can't save the note",
        "The note is no longer a record of this type. Check its schema property in Obsidian.",
        undefined,
      ],
      [
        "warning",
        "Can't save the note",
        "The note was saved by a newer version of WEG Manager in the meantime, for example on another device. Update WEG Manager, then open the note again.",
        undefined,
      ],
      [
        "warning",
        "Can't save the note",
        "The note's id was changed, so it now belongs to another record. Close the form and open it again.",
        undefined,
      ],
      [
        "warning",
        "Can't save the note",
        "Another note has the same id, so it's unclear which one is meant. Delete the duplicate note in Obsidian, then try again.",
        undefined,
      ],
      [
        "warning",
        "Can't save the note",
        "The note couldn't be converted to the current version. Open the note and check its properties.",
        undefined,
      ],
      [
        "warning",
        "Can't save the note",
        "The note's properties are written in a form WEG Manager can't change without changing other lines too. In Obsidian, write each property on a line of its own as key: value between two --- lines, then save again.",
        undefined,
      ],
      [
        "warning",
        "Couldn't read notes",
        "Obsidian couldn't read every note, so the list may be incomplete. Try again.",
        "retry",
      ],
    ]);
  });
});
