import { describe, expect, it } from "vitest";
import {
  LANGUAGES,
  catalogFor,
  de,
  describeIssue,
  describeIssues,
  en,
  greetingOf,
  languageFromCode,
  type Catalog,
} from "../../../src/application/i18n";
import { DEFAULT_SETTINGS, type SettingsIssue } from "../../../src/domain/settings";

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
  { code: "greeting.length", max: 200 },
  { code: "logLevel.unknown", allowed: ["error", "warn", "info", "debug"] },
];

describe("languageFromCode", () => {
  it.each(["de", "DE", "de-AT", "de-CH", "de_DE", " de "])("maps %j to German", (code) => {
    expect(languageFromCode(code)).toBe("de");
  });

  it.each(["en", "en-GB", "fr", "pt-BR", "zh-TW", "deu", "", "/home/me/de.json"])(
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
    expect(de.language).toBe("de");
    expect(en.language).toBe("en");
  });

  it("has the same keys in both languages and no empty text", () => {
    expect(shape(en)).toEqual(shape(de));
    for (const catalog of [de, en] as Catalog[]) {
      for (const text of strings(catalog)) expect(text.trim()).not.toBe("");
    }
  });

  it("words every domain issue in both languages", () => {
    expect(ISSUES.map((issue) => describeIssue(issue, de))).toEqual([
      "Die Einstellungsdatei enthält keine gültigen Einstellungen.",
      "Die Einstellungen stammen aus einer neueren Plugin-Version (Schemaversion 3).",
      "Die Schemaversion muss eine positive ganze Zahl sein.",
      "Die Begrüßung muss 1 bis 200 Zeichen lang sein.",
      "Die Protokollstufe muss eine von error, warn, info, debug sein.",
    ]);
    expect(ISSUES.map((issue) => describeIssue(issue, en))).toEqual([
      "The settings file contains no valid settings.",
      "The settings come from a newer plugin version (schema version 3).",
      "The schema version must be a positive whole number.",
      "The greeting must be 1 to 200 characters long.",
      "The log level must be one of error, warn, info, debug.",
    ]);
    expect(describeIssues([], en)).toBe("");
  });
});

describe("greetingOf", () => {
  it("shows the default greeting of the UI language while it is not customised", () => {
    expect(greetingOf(DEFAULT_SETTINGS, de)).toBe("Hallo von WEG Manager");
    expect(greetingOf(DEFAULT_SETTINGS, en)).toBe("Hello from WEG Manager");
  });

  it("keeps a typed greeting in every language", () => {
    const settings = { ...DEFAULT_SETTINGS, greeting: "Moin" };
    expect(greetingOf(settings, de)).toBe("Moin");
    expect(greetingOf(settings, en)).toBe("Moin");
  });
});

/** Product copy outside of messages, pinned for both languages. */
describe("surface texts", () => {
  it("names commands, ribbon, actions and the settings tab", () => {
    expect([de.commands, de.ribbonTitle, de.actions]).toEqual([
      {
        openView: "Ansicht öffnen",
        showGreeting: "Begrüßung anzeigen",
        copyDiagnostics: "Diagnose kopieren",
      },
      "WEG Manager öffnen",
      {
        retry: "Erneut versuchen",
        "open-settings": "Einstellungen öffnen",
        "copy-diagnostics": "Diagnose kopieren",
      },
    ]);
    expect([en.commands, en.ribbonTitle, en.actions]).toEqual([
      { openView: "Open view", showGreeting: "Show greeting", copyDiagnostics: "Copy diagnostics" },
      "Open WEG Manager",
      {
        retry: "Try again",
        "open-settings": "Open settings",
        "copy-diagnostics": "Copy diagnostics",
      },
    ]);
    expect(en.settingsTab).toEqual({
      greeting: { name: "Greeting", desc: "Text that the “Show greeting” command shows." },
      logLevel: {
        name: "Log level",
        desc: "How much the plugin writes to the developer console.",
        labels: { error: "Errors", warn: "Warnings", info: "Information", debug: "Details" },
      },
    });
  });

  it("counts Markdown files in singular and plural", () => {
    expect([0, 1, 2].map((count) => de.panel.markdownFiles(count))).toEqual([
      "0 Markdown-Dateien im Vault",
      "1 Markdown-Datei im Vault",
      "2 Markdown-Dateien im Vault",
    ]);
    expect([0, 1, 2].map((count) => en.panel.markdownFiles(count))).toEqual([
      "0 Markdown files in the vault",
      "1 Markdown file in the vault",
      "2 Markdown files in the vault",
    ]);
  });

  it("words the panel, the form, the About dialog and the copy confirmation", () => {
    expect([de.panel.counting, de.greetingForm, de.diagnosticsCopied]).toEqual([
      "Zähle Notizen …",
      { label: "Begrüßung", save: "Speichern" },
      { title: "Diagnose kopiert", detail: "Füge den Bericht in deine Support-Anfrage ein." },
    ]);
    expect([en.panel.counting, en.greetingForm, en.diagnosticsCopied, en.about]).toEqual([
      "Counting notes…",
      { label: "Greeting", save: "Save" },
      { title: "Diagnostics copied", detail: "Paste the report into your support request." },
      {
        title: "About WEG Manager",
        description: "Tools for the advisory boards of condominium owners' associations.",
        button: "About",
        body: "Copy the version, platform and log with the “Copy diagnostics” command.",
      },
    ]);
  });
});
