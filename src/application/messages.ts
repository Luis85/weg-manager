import { Layer } from "effect";
import { catalogOf, type CatalogOf } from "./module";
import { APP_MODULES, type AppModule } from "./modules";
import { Messages, type Language } from "./shell";

/**
 * Every text the user sees, for one language: one part per module (ADR 0006), each typed by its
 * module, so a key missing in one language fails typecheck in the module's manifest. The
 * `Messages` service holds it whole.
 */
export type Catalog = CatalogOf<AppModule>;

export const de: Catalog = catalogOf(APP_MODULES, "de");
export const en: Catalog = catalogOf(APP_MODULES, "en");

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
