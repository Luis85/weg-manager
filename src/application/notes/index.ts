// The public face of the notes module's application layer for features, other layers and the
// composition files (ADR 0006). The kit of the `NoteStore` adapters is the second entry,
// `adapter.ts`, which only `src/infrastructure/**` imports.
export {
  InvalidNoteNameError,
  NoteEditConflictError,
  NoteIndexReadError,
  NoteNotFoundError,
  NotePathTakenError,
  NoteTrashError,
  NoteUnreadableError,
  NoteWriteError,
  NoteWriteRefusedError,
  type NotesError,
} from "./errors";
export { isInFolder } from "./folders";
export type { NotesCatalog } from "./i18n/catalog";
export { describeNoteIssue, describeUnindexedIssue } from "./i18n/describe";
export { notesDe } from "./i18n/de";
export { notesEn } from "./i18n/en";
export { openNote } from "./open-note";
export { applyPatch } from "./patch";
export { editChange, newRecordFrontmatter } from "./records";
export {
  IdGenerator,
  NoteOpener,
  NoteStore,
  type Frontmatter,
  type FrontmatterChange,
  type FrontmatterPatch,
  type NewNote,
  type Note,
} from "./ports";
export type { NotesServices } from "./services";
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
