import { property, assert as fcAssert, string } from "fast-check";
import { describe, expect, it } from "vitest";
import type { AppError } from "../../../../src/application/errors";
import { de, en } from "../../../../src/application/messages";
import {
  InvalidNoteNameError,
  NoteEditConflictError,
  NoteNotFoundError,
  NotePathTakenError,
  NoteUnreadableError,
  NoteWriteError,
  NoteWriteRefusedError,
} from "../../../../src/application/notes/errors";
import { isNotesError } from "../../../../src/application/notes/user-messages";
import { StorageError, VaultReadError } from "../../../../src/application/shell/errors";
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
  new NoteEditConflictError({
    conflicts: [{ key: "title", base: "a", edited: "b", current: "c" }],
  }),
  new NoteWriteRefusedError({ reason: "other-type" }),
  new NoteWriteRefusedError({ reason: "newer-version" }),
  new NoteWriteRefusedError({ reason: "identity" }),
  new NoteWriteRefusedError({ reason: "migration-failed" }),
];

describe("isNotesError", () => {
  it("is true for every notes error and false for the shell's", () => {
    for (const error of ALL) expect(isNotesError(error)).toBe(true);
    expect(isNotesError(new VaultReadError({ cause: null }))).toBe(false);
    expect(isNotesError(new StorageError({ cause: null }))).toBe(false);
  });
});

describe.each([de, en])("describeError for notes ($shell.language)", (messages) => {
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
      (["other-type", "newer-version", "identity", "migration-failed"] as const).map(
        (reason) => describeError(new NoteWriteRefusedError({ reason }), messages).detail,
      ),
    );
    expect(details.size).toBe(4);
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
      property(string(), (text) => {
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
describe("notes message texts", () => {
  it("has exact German texts", () => {
    expect(ALL.map((error) => describeError(error, de))).toEqual([
      {
        severity: "warning",
        title: "Notiz nicht gefunden",
        detail: "Die Notiz wurde verschoben oder gelöscht. Prüfe, ob sie noch im Vault liegt.",
      },
      {
        severity: "warning",
        title: "Name schon vergeben",
        detail: "Im Ordner gibt es schon eine Notiz mit diesem Namen. Wähle einen anderen Namen.",
      },
      {
        severity: "warning",
        title: "Name nicht möglich",
        detail: "Der Name ist leer. Gib einen Namen ein.",
      },
      {
        severity: "warning",
        title: "Name nicht möglich",
        detail:
          "Der Name enthält ein Zeichen, das in Dateinamen nicht vorkommen darf, etwa einen Schrägstrich oder Doppelpunkt. Entferne es.",
      },
      {
        severity: "warning",
        title: "Name nicht möglich",
        detail:
          "Der Name beginnt mit einem Punkt, dann blendet Obsidian die Notiz aus. Entferne den Punkt.",
      },
      {
        severity: "warning",
        title: "Eigenschaften nicht lesbar",
        detail:
          "Die Eigenschaften der Notiz sind kein gültiges YAML. Korrigiere sie in Obsidian und versuche es dann erneut.",
      },
      {
        severity: "error",
        title: "Notiz nicht gespeichert",
        detail: "Obsidian konnte die Notiz nicht schreiben. Versuche es erneut.",
        action: "retry",
      },
      {
        severity: "warning",
        title: "Notiz inzwischen geändert",
        detail:
          "Die Notiz wurde außerhalb des Formulars geändert, auch in Feldern, die du bearbeitet hast. Wähle für jedes dieser Felder den Wert, der gelten soll, und speichere erneut.",
      },
      {
        severity: "warning",
        title: "Speichern nicht möglich",
        detail:
          "Die Notiz ist inzwischen kein Datensatz dieses Typs mehr. Prüfe ihre Eigenschaft „schema“ in Obsidian.",
      },
      {
        severity: "warning",
        title: "Speichern nicht möglich",
        detail:
          "Eine neuere Plugin-Version hat die Notiz inzwischen gespeichert. Aktualisiere WEG Manager und öffne sie dann erneut.",
      },
      {
        severity: "warning",
        title: "Speichern nicht möglich",
        detail:
          "Die „id“ der Notiz hat sich inzwischen geändert, sie ist also nicht mehr derselbe Datensatz. Öffne die Notiz erneut.",
      },
      {
        severity: "warning",
        title: "Speichern nicht möglich",
        detail:
          "Die Notiz ließ sich nicht auf die aktuelle Schemaversion umstellen. Prüfe ihre Eigenschaften in Obsidian.",
      },
    ]);
  });

  it("has exact English texts", () => {
    expect(ALL.map((error) => describeError(error, en))).toEqual([
      {
        severity: "warning",
        title: "Note not found",
        detail: "The note was moved or deleted. Check that it's still in the vault.",
      },
      {
        severity: "warning",
        title: "Name already taken",
        detail: "The folder already has a note with this name. Choose another name.",
      },
      {
        severity: "warning",
        title: "Can't use this name",
        detail: "The name is empty. Enter a name.",
      },
      {
        severity: "warning",
        title: "Can't use this name",
        detail:
          "The name contains a character that file names can't hold, such as a slash or a colon. Remove it.",
      },
      {
        severity: "warning",
        title: "Can't use this name",
        detail: "The name starts with a dot, so Obsidian would hide the note. Remove the dot.",
      },
      {
        severity: "warning",
        title: "Can't read properties",
        detail: "The note's properties aren't valid YAML. Fix them in Obsidian, then try again.",
      },
      {
        severity: "error",
        title: "Note not saved",
        detail: "Obsidian couldn't write the note. Try again.",
        action: "retry",
      },
      {
        severity: "warning",
        title: "Note changed meanwhile",
        detail:
          "The note was changed outside the form, also in fields you edited. Choose the value to keep for each of those fields, then save again.",
      },
      {
        severity: "warning",
        title: "Can't save the note",
        detail:
          "The note is no longer a record of this type. Check its schema property in Obsidian.",
      },
      {
        severity: "warning",
        title: "Can't save the note",
        detail:
          "A newer plugin version saved the note meanwhile. Update WEG Manager, then open the note again.",
      },
      {
        severity: "warning",
        title: "Can't save the note",
        detail:
          "The note's id changed meanwhile, so it's no longer the same record. Open the note again.",
      },
      {
        severity: "warning",
        title: "Can't save the note",
        detail:
          "The note couldn't be converted to the current schema version. Check its properties in Obsidian.",
      },
    ]);
  });
});
