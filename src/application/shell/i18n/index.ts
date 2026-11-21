import { Layer } from "effect";
import type { Settings, SettingsIssue } from "../../../domain/shell/settings";
import type { Catalog, Language } from "./catalog";
import { de } from "./de";
import { en } from "./en";
import { Messages } from "../ports";

export { LANGUAGES, PRODUCT_NAME, type Catalog, type Language } from "./catalog";
export { de } from "./de";
export { en } from "./en";

const CATALOGS: Readonly<Record<Language, Catalog>> = { de, en };

export const catalogFor = (language: Language): Catalog => CATALOGS[language];

/**
 * Maps Obsidian's language code (`getLanguage()`, e.g. `de`, `en-GB`, `pt-BR`) to a plugin
 * language: German in any region is German, every other language falls back to English.
 */
export const languageFromCode = (code: string): Language =>
  /^de(?:[-_]|$)/i.test(code.trim()) ? "de" : "en";

/** One domain issue as a sentence of the catalog's language. */
export const describeIssue = (issue: SettingsIssue, messages: Catalog): string => {
  switch (issue.code) {
    case "file.invalid":
      return messages.issues[issue.code](issue);
    case "schema.newer":
      return messages.issues[issue.code](issue);
    case "schema.invalid":
      return messages.issues[issue.code](issue);
    case "greeting.length":
      return messages.issues[issue.code](issue);
    case "logLevel.unknown":
      return messages.issues[issue.code](issue);
  }
};

/** Several issues as one text, in the order they were found. */
export const describeIssues = (issues: readonly SettingsIssue[], messages: Catalog): string =>
  issues.map((issue) => describeIssue(issue, messages)).join(" ");

/** The greeting the user sees: the stored one, or the default of the UI language. */
export const greetingOf = (settings: Settings, messages: Catalog): string =>
  settings.greeting ?? messages.defaultGreeting;

/** The catalog of `language` as the `Messages` service of one runtime. */
export const messagesLayer = (language: Language) => Layer.succeed(Messages)(catalogFor(language));
