// The public face of the notes domain (ADR 0006): other modules and layers import only this.
export { defineNoteType, type NoteType } from "./codec";
export { markDuplicateIds } from "./duplicates";
export {
  checkbox,
  date,
  isControlCharacter,
  lineOfText,
  list,
  number,
  required,
  text,
} from "./fields";
export { followsTitle, recordFileName } from "./file-name";
export { editedValues, trimmedValues, type FormDraft, type FormInput } from "./form";
export type {
  DecodedNote,
  EditableRecord,
  FieldIssue,
  Frontmatter,
  FrontmatterPatch,
  Migrations,
  NoteFields,
  NoteInput,
  NoteIssue,
  ReadOnlyRecord,
  RecordIssue,
  RecordValues,
  UnindexedIssue,
} from "./note-type";
export {
  editNoteText,
  frontmatterYaml,
  newNoteText,
  splitNoteText,
  type NoteText,
} from "./note-text";
export {
  MAX_NAME_ATTEMPTS,
  NoteNameIssue,
  clashKey,
  clashName,
  isRecordFrontmatter,
  noteNameIssue,
} from "./notes";
export { parseRecordId, recordId } from "./record-id";
export { RECORD_SCHEMA_PREFIX, parseSchemaMarker } from "./schema-marker";
export { FieldConflict, WriteRefusal, type MergeFailure } from "./write";
