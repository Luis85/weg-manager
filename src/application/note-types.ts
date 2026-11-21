import { communityType } from "../domain/communities";
import type { NoteTypeRegistry } from "./notes";

/**
 * The note types of every feature module, for the note index (ADR 0006, ADR 0007): composition
 * only, like `routes.ts`. A feature adds its type here, from its domain index.
 */
export const appNoteTypes: NoteTypeRegistry = [communityType];
