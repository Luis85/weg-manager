// The public face of the notes domain (ADR 0006): other modules and layers import only this.
export { defineNoteType, type NoteType } from "./codec";
export { markDuplicateIds } from "./duplicates";
export {
  checkbox,
  date,
  lineOfText,
  list,
  number,
  reference,
  references,
  required,
  text,
  type FieldDeclaration,
  type FieldKind,
  type KindIssueCode,
} from "./fields";
export { MAX_FILE_NAME_BYTES, fitsFileName, followsTitle, recordFileName } from "./file-name";
export {
  draftValues,
  editedValues,
  formInput,
  fromInput,
  toInput,
  trimmedValues,
  type FormDraft,
  type FormInput,
  type FormValue,
} from "./form";
export type {
  DecodedNote,
  EditableRecord,
  FieldIssue,
  Frontmatter,
  FrontmatterPatch,
  Migrations,
  MissingReference,
  NoteFields,
  NoteInput,
  NoteIssue,
  PartialValues,
  ReadOnlyRecord,
  RecordFieldIssue,
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
export { markMissingReferences } from "./references";
export { RECORD_SCHEMA_PREFIX, parseSchemaMarker } from "./schema-marker";
export { FieldConflict, WriteRefusal, type MergeFailure } from "./write";
