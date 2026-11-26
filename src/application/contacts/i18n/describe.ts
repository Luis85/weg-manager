import { describeRecordIssue, type NotesCatalog } from "../../notes";
import type { ContactIssue, ContactNoteIssue } from "../list";
import type { ContactsCatalog } from "./catalog";

/**
 * One issue of a contact note or form as a sentence of the catalog's language: the notes
 * module's `describeRecordIssue` with this module's labels, missing-field sentences and codes.
 */
export const describeContactIssue = (
  issue: ContactNoteIssue,
  texts: { readonly notes: NotesCatalog; readonly contacts: ContactsCatalog },
): string => describeRecordIssue<ContactIssue>(issue, texts.notes, texts.contacts);
