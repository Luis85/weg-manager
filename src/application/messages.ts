import { Layer } from "effect";
import { communitiesDe, communitiesEn, type CommunitiesCatalog } from "./communities";
import { notesDe, notesEn, type NotesCatalog } from "./notes";
import { Messages, shellDe, shellEn, type Language, type ShellCatalog } from "./shell";

/**
 * Every text the user sees, for one language: one part per module (ADR 0006), each typed by its
 * module, so a key missing in one language fails typecheck. The `Messages` service holds it whole.
 */
export type Catalog = {
  readonly shell: ShellCatalog;
  readonly notes: NotesCatalog;
  readonly communities: CommunitiesCatalog;
};

export const de: Catalog = { shell: shellDe, notes: notesDe, communities: communitiesDe };
export const en: Catalog = { shell: shellEn, notes: notesEn, communities: communitiesEn };

const CATALOGS: Readonly<Record<Language, Catalog>> = { de, en };

export const catalogFor = (language: Language): Catalog => CATALOGS[language];

/**
 * Maps Obsidian's language code (`getLanguage()`, e.g. `de`, `en-GB`, `pt-BR`) to a plugin
 * language: German in any region is German, every other language falls back to English.
 */
export const languageFromCode = (code: string): Language =>
  /^de(?:[-_]|$)/i.test(code.trim()) ? "de" : "en";

/** The catalog of `language` as the `Messages` service of one runtime. */
export const messagesLayer = (language: Language) => Layer.succeed(Messages)(catalogFor(language));
