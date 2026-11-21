// The public face of the notes module's application layer (ADR 0006): feature modules, other
// layers and the composition files import only this.
export {
  NoteNotFoundError,
  NotePathTakenError,
  NoteUnreadableError,
  type NotesError,
} from "./errors";
export { applyPatch, copyFrontmatter, recordNotes } from "./frontmatter";
export type { NotesCatalog } from "./i18n/catalog";
export { notesDe } from "./i18n/de";
export { notesEn } from "./i18n/en";
export { createNote, writeCommand } from "./command";
export { checkNoteName, renamedNotePath } from "./paths";
export {
  NoteStore,
  type Frontmatter,
  type FrontmatterChange,
  type NewNote,
  type Note,
} from "./ports";
export type { NotesServices } from "./services";
export { describeNotesError, isNotesError } from "./user-messages";
