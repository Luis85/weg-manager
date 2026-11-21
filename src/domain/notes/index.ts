// The public face of the notes domain (ADR 0006): other modules and layers import only this.
export { defineNoteType, type NoteType } from "./codec";
export { markDuplicateIds } from "./duplicates";
export { checkbox, date, list, number, required, text } from "./fields";
export type {
  FieldIssue,
  Frontmatter,
  Migrations,
  NoteFields,
  NoteIssue,
  RecordIssue,
  RecordValues,
} from "./note-type";
export { NoteNameIssue, clashKey, clashName, isRecordFrontmatter, noteNameIssue } from "./notes";
export { parseRecordId, recordId } from "./record-id";
export { RECORD_SCHEMA_PREFIX } from "./schema-marker";
export { WriteRefusal, type MergeFailure } from "./write";
