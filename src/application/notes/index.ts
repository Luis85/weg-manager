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
  NoteOpenError,
  NoteUnreadableError,
  NoteWriteError,
  NoteWriteRefusedError,
} from "./errors";
export { isInFolder, recordFolder } from "./folders";
export type { IssueSentences, NotesCatalog, RecordTexts } from "./i18n/catalog";
export { describeNoteIssue, describeRecordIssue, describeUnindexedIssue } from "./i18n/describe";
export { notesModule } from "./module";
export { openNote } from "./open-note";
export { applyPatch } from "./patch";
export { editChange, newRecordFrontmatter } from "./records";
export { defineRecords } from "./record-kit";
export {
  fileNameOf,
  shownReference,
  type RecordList,
  type RecordRow,
  type ReferenceNames,
  type ReferenceSource,
} from "./record-list";
export {
  IdGenerator,
  NoteOpener,
  NoteStore,
  type BodyEdit,
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
