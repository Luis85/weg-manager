import type { NoteTypeRegistry } from "./notes";

/**
 * The note types of every feature module, for the note index (ADR 0006, ADR 0007): composition
 * only, like `routes.ts`. No feature declares one yet. A feature adds its type here, for example
 * `export const appNoteTypes: NoteTypeRegistry = [communityType];`, with `communityType` from its
 * domain index.
 */
export const appNoteTypes: NoteTypeRegistry = [];
