import { describe, expect, it } from "vitest";
import { property, assert as fcAssert, string } from "fast-check";
import {
  ClipboardError,
  InvalidSettingsError,
  ReadOnlySettingsError,
  StorageError,
  VaultReadError,
} from "../../../../src/application/shell/errors";
import type { AppError } from "../../../../src/application/errors";
import { de, en } from "../../../../src/application/messages";
import { describeIssue } from "../../../../src/application/shell/i18n/describe";
import {
  describeDefect,
  describeSettingsIssues,
  type UserMessage,
} from "../../../../src/application/shell/user-messages";
import { describeError } from "../../../../src/application/user-messages";
import type { SettingsIssue } from "../../../../src/domain/shell/settings";

const FORBIDDEN = ["Error", "stack", "/", "\\"];
const CATALOGS = [de, en] as const;

const ROOT_FOLDER: SettingsIssue = { code: "rootFolder.invalid", max: 100 };
const LOG_LEVEL: SettingsIssue = { code: "logLevel.unknown", allowed: ["error", "warn"] };

const expectPlain = (message: UserMessage, rawCause?: string) => {
  expect(message.title.trim()).not.toBe("");
  expect(message.detail.trim()).not.toBe("");
  for (const text of [message.title, message.detail]) {
    for (const forbidden of FORBIDDEN) expect(text).not.toContain(forbidden);
    if (rawCause !== undefined && rawCause.trim().length > 3) expect(text).not.toContain(rawCause);
  }
};

describe.each(CATALOGS)("describeError ($language)", (messages) => {
  it("asks to retry when the vault cannot be read", () => {
    const error = new VaultReadError({ cause: new Error("EACCES /vault") });
    const message = describeError(error, messages);
    expectPlain(message, "EACCES /vault");
    expect(message).toMatchObject({ severity: "error", action: "retry" });
  });

  it("asks to retry when saving fails", () => {
    const message = describeError(new StorageError({ cause: new Error("disk full") }), messages);
    expectPlain(message, "disk full");
    expect(message).toMatchObject({ severity: "error", action: "retry" });
  });

  it.each(["newer-version", "unreadable"] as const)(
    "offers diagnostics for read-only settings (%s)",
    (reason) => {
      const message = describeError(new ReadOnlySettingsError({ reason }), messages);
      expectPlain(message);
      expect(message).toMatchObject({ severity: "warning", action: "copy-diagnostics" });
    },
  );

  it("explains the two read-only reasons differently", () => {
    const newer = describeError(new ReadOnlySettingsError({ reason: "newer-version" }), messages);
    const unreadable = describeError(new ReadOnlySettingsError({ reason: "unreadable" }), messages);
    expect(newer.detail).not.toBe(unreadable.detail);
  });

  it("lists every issue of invalid settings and offers no action", () => {
    const other: SettingsIssue = { code: "schema.invalid" };
    const error = new InvalidSettingsError({ issues: [other, LOG_LEVEL] });
    const message = describeError(error, messages);
    expectPlain(message);
    expect(message.detail).toBe(
      `${describeIssue(other, messages.shell)} ${describeIssue(LOG_LEVEL, messages.shell)}`,
    );
    expect(message.action).toBeUndefined();
    expect(message.severity).toBe("warning");
  });

  it("asks to retry when the clipboard fails", () => {
    const message = describeError(new ClipboardError({ cause: new Error("denied") }), messages);
    expectPlain(message, "denied");
    expect(message.action).toBe("retry");
  });

  it("never leaks the cause text of any error", () => {
    expect.hasAssertions();
    // Bracketed, so no catalog text can hold it by chance (a bare "rope" is in "properties").
    const cause = string().map((text) => `⟦${text}⟧`);
    fcAssert(
      property(cause, (text) => {
        const errors: AppError[] = [
          new StorageError({ cause: new Error(text) }),
          new VaultReadError({ cause: new Error(text) }),
          new ClipboardError({ cause: text }),
        ];
        for (const error of errors) expectPlain(describeError(error, messages), text);
      }),
    );
  });

  it("names the plugin and the incident id of a defect and offers diagnostics", () => {
    const message = describeDefect("K7Q2", messages.shell);
    expectPlain(message);
    expect(message.title).toContain("WEG Manager");
    expect(message.detail).toContain("K7Q2");
    expect(message).toMatchObject({ severity: "error", action: "copy-diagnostics" });
  });
});

/** The catalog is product copy: a change here is a deliberate wording change. */
describe("message catalog texts", () => {
  it("has exact German texts for every expected failure", () => {
    expect(
      describeError(new InvalidSettingsError({ issues: [ROOT_FOLDER, LOG_LEVEL] }), de),
    ).toEqual({
      severity: "warning",
      title: "Eingabe ungültig",
      detail:
        'Der Wurzelordner muss ein Ordnerpfad im Vault mit höchstens 100 Zeichen sein, mit „/“ zwischen den Ordnernamen, ohne Ordnernamen, die mit „.“ beginnen (solche Ordner blendet Obsidian aus), und ohne die Zeichen * " \\ < > : | ?. Die Protokollstufe muss eine von error, warn sein.',
    });
    expect(describeError(new VaultReadError({ cause: null }), de)).toEqual({
      severity: "error",
      title: "Notizen nicht lesbar",
      detail: "Die Dateien im Vault konnten nicht gelesen werden. Versuche es erneut.",
      action: "retry",
    });
    expect(describeError(new ClipboardError({ cause: null }), de)).toEqual({
      severity: "error",
      title: "Diagnose nicht kopiert",
      detail: "Die Zwischenablage ist nicht verfügbar. Versuche es erneut.",
      action: "retry",
    });
    expect(describeError(new StorageError({ cause: null }), de)).toEqual({
      severity: "error",
      title: "Einstellungen nicht gespeichert",
      detail:
        "Die Einstellungsdatei konnte nicht geschrieben werden. Deine Eingabe ist erhalten. Speichere erneut.",
      action: "retry",
    });
    expect(describeError(new ReadOnlySettingsError({ reason: "unreadable" }), de)).toEqual({
      severity: "warning",
      title: "Einstellungen schreibgeschützt",
      detail:
        "Die Einstellungsdatei ist nicht lesbar. Es gelten Standardwerte, die Datei bleibt unverändert. Kopiere die Diagnose und melde es auf der GitHub-Seite des Plugins.",
      action: "copy-diagnostics",
      link: "https://github.com/Luis85/weg-manager/issues",
    });
    expect(describeError(new ReadOnlySettingsError({ reason: "newer-version" }), de)).toEqual({
      severity: "warning",
      title: "Einstellungen schreibgeschützt",
      detail:
        "Die Einstellungen stammen aus einer neueren Version von WEG Manager. Aktualisiere das Plugin, um sie zu ändern.",
      action: "copy-diagnostics",
    });
  });

  it("has exact English texts for a sample of failures", () => {
    expect(describeError(new VaultReadError({ cause: null }), en)).toEqual({
      severity: "error",
      title: "Can't read notes",
      detail: "The files in the vault couldn't be read. Try again.",
      action: "retry",
    });
    expect(describeError(new ReadOnlySettingsError({ reason: "unreadable" }), en)).toEqual({
      severity: "warning",
      title: "Settings are read-only",
      detail:
        "The settings file can't be read. Default values apply and the file stays unchanged. Copy the diagnostics and report this on the plugin's GitHub page.",
      link: "https://github.com/Luis85/weg-manager/issues",
      action: "copy-diagnostics",
    });
    expect(describeError(new InvalidSettingsError({ issues: [ROOT_FOLDER] }), en)).toEqual({
      severity: "warning",
      title: "Invalid input",
      detail:
        'The root folder must be a vault folder path of at most 100 characters, with "/" between folder names, without folder names that start with "." (Obsidian hides such folders) and without the characters * " \\ < > : | ?.',
    });
  });

  it("explains partially reset settings with every issue", () => {
    expect(describeSettingsIssues([ROOT_FOLDER, { code: "file.invalid" }], de.shell)).toEqual({
      severity: "warning",
      title: "Einstellungen teilweise zurückgesetzt",
      detail:
        'Der Wurzelordner muss ein Ordnerpfad im Vault mit höchstens 100 Zeichen sein, mit „/“ zwischen den Ordnernamen, ohne Ordnernamen, die mit „.“ beginnen (solche Ordner blendet Obsidian aus), und ohne die Zeichen * " \\ < > : | ?. Die Einstellungsdatei enthält keine gültigen Einstellungen. Für diese Werte gelten Standardwerte. Prüfe die Einstellungen.',
      action: "open-settings",
    });
    expect(describeSettingsIssues([{ code: "schema.invalid" }], en.shell)).toEqual({
      severity: "warning",
      title: "Settings partly reset",
      detail:
        "The schema version must be a positive whole number. Default values apply to these settings. Check the settings.",
      action: "open-settings",
    });
  });

  it("words a defect exactly", () => {
    expect(describeDefect("K7Q2", de.shell)).toEqual({
      severity: "error",
      title: "Unerwarteter Fehler in WEG Manager",
      detail:
        "Die Aktion wurde abgebrochen (Fehlercode K7Q2). Kopiere die Diagnose und melde den Fehler mit dem Fehlercode auf der GitHub-Seite des Plugins. Der Bericht enthält keine Inhalte deiner Notizen.",
      link: "https://github.com/Luis85/weg-manager/issues",
      action: "copy-diagnostics",
    });
    expect(describeDefect("K7Q2", en.shell)).toEqual({
      severity: "error",
      title: "Unexpected error in WEG Manager",
      detail:
        "The action was stopped (error code K7Q2). Copy the diagnostics and report the error with its code on the plugin's GitHub page. The report contains no content of your notes.",
      link: "https://github.com/Luis85/weg-manager/issues",
      action: "copy-diagnostics",
    });
  });
});
