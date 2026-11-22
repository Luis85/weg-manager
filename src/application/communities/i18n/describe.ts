import { describeRecordIssue, type NotesCatalog } from "../../notes";
import type { CommunityNoteIssue } from "../list";
import type { CommunitiesCatalog } from "./catalog";

/**
 * One issue of a community note or form as a sentence of the catalog's language: the notes
 * module's `describeRecordIssue` with this module's labels, missing-field sentences and codes.
 */
export const describeCommunityIssue = (
  issue: CommunityNoteIssue,
  texts: { readonly notes: NotesCatalog; readonly communities: CommunitiesCatalog },
): string => describeRecordIssue(issue, texts.notes, texts.communities);
