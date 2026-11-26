import { communitiesModule } from "./communities";
import { contactsModule } from "./contacts";
import { mattersModule } from "./matters";
import { notesModule } from "./notes";
import { shellModule } from "./shell";

/**
 * Every module of the plugin, in load order: the core modules `shell` and `notes` first, then the
 * feature modules (ADR 0006, amendment 2026-11-22). This is the one module list: a new module adds
 * its manifest (its `module.ts`, from its application index) here. Every composed type and value
 * of the application root is derived from it (`Catalog`, `AppError`, `describeError`, `Route`,
 * `appNoteTypes`, `appCommands`, `AppServices`), and so are the module lists of ESLint and fallow
 * (`scripts/modules.mjs` reads the names from this file). Presentation adds each module's screens
 * in `src/presentation/app-surface.ts`.
 */
export const APP_MODULES = [
  shellModule,
  notesModule,
  communitiesModule,
  contactsModule,
  mattersModule,
] as const;

/** The manifest of any module of the plugin. */
export type AppModule = (typeof APP_MODULES)[number];

/** The name of a module, which is its folder name in every layer. */
export type AppModuleName = AppModule["name"];
