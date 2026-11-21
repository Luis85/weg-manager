// The public face of the notes module's application layer (ADR 0006): feature modules, other
// layers and the composition files import only this.
export {
  NoteEditConflictError,
  NoteIndexReadError,
  NoteNotFoundError,
  NoteUnreadableError,
  NoteWriteRefusedError,
  type NotesError,
} from "./errors";
export { applyPatch, copyFrontmatter, recordNotes } from "./frontmatter";
export type { NotesCatalog } from "./i18n/catalog";
export { describeNoteIssue, describeUnindexedIssue } from "./i18n/describe";
export { notesDe } from "./i18n/de";
export { notesEn } from "./i18n/en";
export { createNote, writeCommand } from "./command";
export { pathsInFolder, planRename } from "./paths";
export { editChange, newRecordFrontmatter } from "./records";
export {
  IdGenerator,
  NoteStore,
  type Frontmatter,
  type FrontmatterChange,
  type NewNote,
  type Note,
} from "./ports";
export type { NotesServices } from "./services";
export { INDEX_BATCH_MAX, INDEX_BATCH_QUIET } from "./index-batches";
export { noteIndexLayer } from "./index-live";
export {
  noteChanges,
  noteSnapshot,
  rebuildNoteIndex,
  unindexedChanges,
  unindexedSnapshot,
} from "./index-use-cases";
export {
  NoteIndex,
  type IndexStatus,
  type IndexedNote,
  type IndexedType,
  type NoteSnapshot,
  type NoteTypeRegistry,
  type UnindexedSnapshot,
} from "./note-index";
export { describeNotesError, isNotesError } from "./user-messages";
