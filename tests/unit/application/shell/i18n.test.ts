import { describe, expect, it } from "vitest";
import {
  catalogFor,
  de,
  en,
  languageFromCode,
  type Catalog,
} from "../../../../src/application/messages";
import { LANGUAGES } from "../../../../src/application/shell/i18n/catalog";
import { describeIssue, describeIssues } from "../../../../src/application/shell/i18n/describe";
import type { SettingsIssue } from "../../../../src/domain/shell/settings";

/** Each leaf as `path: kind`, where a function is called with a sample to check it returns text. */
const shape = (value: unknown, path = ""): string[] => {
  if (typeof value === "function") return [`${path}: function`];
  if (typeof value === "object" && value !== null) {
    return Object.entries(value)
      .toSorted(([a], [b]) => a.localeCompare(b))
      .flatMap(([key, inner]) => shape(inner, `${path}.${key}`));
  }
  return [`${path}: ${typeof value}`];
};

const strings = (value: unknown): string[] => {
  if (typeof value === "string") return [value];
  if (typeof value === "object" && value !== null) return Object.values(value).flatMap(strings);
  return [];
};

const ISSUES: readonly SettingsIssue[] = [
  { code: "file.invalid" },
  { code: "schema.newer", version: 3 },
  { code: "schema.invalid" },
  { code: "migration.failed", from: 1 },
  { code: "logLevel.unknown", allowed: ["error", "warn", "info", "debug"] },
  { code: "rootFolder.invalid", max: 100 },
];

describe("languageFromCode", () => {
  it.each(["de", "DE", "de-AT", "de-CH", "de_DE", " de "])("maps %j to German", (code) => {
    expect(languageFromCode(code)).toBe("de");
  });

  it.each(["en", "en-GB", "fr", "pt-BR", "zh-TW", "deu", "", "/home/me/de.json", "/home/me/de"])(
    "falls back to English for %j",
    (code) => {
      expect(languageFromCode(code)).toBe("en");
    },
  );
});

describe("catalogs", () => {
  it("has one catalog per language, each naming its own language", () => {
    expect(LANGUAGES).toEqual(["de", "en"]);
    expect(catalogFor("de")).toBe(de);
    expect(catalogFor("en")).toBe(en);
    expect(de.shell.language).toBe("de");
    expect(en.shell.language).toBe("en");
  });

  it("has the same keys in both languages and no empty text", () => {
    expect(shape(en)).toEqual(shape(de));
    for (const catalog of [de, en] as Catalog[]) {
      for (const text of strings(catalog)) expect(text.trim()).not.toBe("");
    }
  });

  it("words every domain issue in both languages", () => {
    expect(ISSUES.map((issue) => describeIssue(issue, de.shell))).toEqual([
      "Die Einstellungsdatei enthält keine gültigen Einstellungen.",
      "Die Einstellungen stammen aus einer neueren Plugin-Version (Schemaversion 3).",
      "Die Schemaversion muss eine positive ganze Zahl sein.",
      "Die Einstellungen aus Schemaversion 1 ließen sich nicht auf die aktuelle Version umstellen.",
      "Die Protokollstufe muss eine von error, warn, info, debug sein.",
      'Der Wurzelordner muss ein Ordnerpfad im Vault mit höchstens 100 Zeichen sein, mit „/“ zwischen den Ordnernamen, ohne Ordnernamen, die mit „.“ beginnen (solche Ordner blendet Obsidian aus), und ohne die Zeichen * " \\ < > : | ?.',
    ]);
    expect(ISSUES.map((issue) => describeIssue(issue, en.shell))).toEqual([
      "The settings file contains no valid settings.",
      "The settings come from a newer plugin version (schema version 3).",
      "The schema version must be a positive whole number.",
      "The settings from schema version 1 couldn't be upgraded to the current version.",
      "The log level must be one of error, warn, info, debug.",
      'The root folder must be a vault folder path of at most 100 characters, with "/" between folder names, without folder names that start with "." (Obsidian hides such folders) and without the characters * " \\ < > : | ?.',
    ]);
    expect(describeIssues([], en.shell)).toBe("");
  });
});

/** Product copy outside of messages, pinned for both languages. */
describe("surface texts", () => {
  it("names commands, actions and the settings tab", () => {
    expect([de.shell.commands, de.shell.actions]).toEqual([
      {
        openView: "Ansicht öffnen",
        copyDiagnostics: "Diagnose kopieren",
      },
      {
        retry: "Erneut versuchen",
        "open-settings": "Einstellungen öffnen",
        "copy-diagnostics": "Diagnose kopieren",
      },
    ]);
    expect([en.shell.commands, en.shell.actions]).toEqual([
      { openView: "Open view", copyDiagnostics: "Copy diagnostics" },
      {
        retry: "Try again",
        "open-settings": "Open settings",
        "copy-diagnostics": "Copy diagnostics",
      },
    ]);
    expect(en.shell.settingsTab).toEqual({
      logLevel: {
        name: "Log level",
        desc: "How much the plugin writes to the developer console.",
        labels: { error: "Errors", warn: "Warnings", info: "Information", debug: "Details" },
      },
    });
  });

  it("words the app frame and the not-found state", () => {
    expect([de.shell.frame, de.shell.notFound]).toEqual([
      {
        navigation: "Ansichten",
        content: "Inhalt",
        back: "Zurück",
        forward: "Vorwärts",
        settingsSections: "Bereiche der Einstellungen",
      },
      {
        title: "Nicht gefunden",
        detail:
          "Was du öffnen wolltest, gibt es nicht mehr. Vielleicht wurde es gelöscht oder umbenannt.",
        back: "Zur Startseite",
      },
    ]);
    expect([en.shell.frame, en.shell.notFound]).toEqual([
      {
        navigation: "Views",
        content: "Content",
        back: "Back",
        forward: "Forward",
        settingsSections: "Settings sections",
      },
      {
        title: "Not found",
        detail: "What you wanted to open no longer exists. It may have been deleted or renamed.",
        back: "Go to the start page",
      },
    ]);
  });

  it("words the copy confirmation", () => {
    expect([de.shell.diagnosticsCopied, en.shell.diagnosticsCopied]).toEqual([
      {
        title: "Diagnose kopiert",
        detail:
          "Hänge den Bericht an deine Meldung auf der GitHub-Seite des Plugins an. Er enthält keine Inhalte deiner Notizen.",
      },
      {
        title: "Diagnostics copied",
        detail:
          "Attach the report to your issue on the plugin's GitHub page. It contains no content of your notes.",
      },
    ]);
  });
});
