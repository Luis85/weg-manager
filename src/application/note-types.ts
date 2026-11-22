import { noteTypesOf } from "./module";
import { APP_MODULES } from "./modules";
import type { NoteTypeRegistry } from "./notes";

/**
 * The note types of every module, for the note index (ADR 0006, ADR 0007), from their manifests.
 */
export const appNoteTypes: NoteTypeRegistry = noteTypesOf(APP_MODULES);
