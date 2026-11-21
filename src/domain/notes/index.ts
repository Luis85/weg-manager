// The public face of the notes domain (ADR 0006): other modules and layers import only this.
export {
  NoteNameIssue,
  RECORD_SCHEMA_PREFIX,
  clashKey,
  clashName,
  isRecordFrontmatter,
  noteNameIssue,
} from "./notes";
