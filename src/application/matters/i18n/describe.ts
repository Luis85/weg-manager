import { describeRecordIssue, type NotesCatalog } from "../../notes";
import type { MatterIssue, MatterNoteIssue } from "../list";
import type { TodoIssue, TodoNoteIssue } from "../todos";
import type { MattersCatalog } from "./catalog";

/** One issue of a matter note or form as a sentence of the catalog's language. */
export const describeMatterIssue = (
  issue: MatterNoteIssue,
  texts: { readonly notes: NotesCatalog; readonly matters: MattersCatalog },
): string => describeRecordIssue<MatterIssue>(issue, texts.notes, texts.matters);

/** One issue of a to-do note or form as a sentence of the catalog's language. */
export const describeTodoIssue = (
  issue: TodoNoteIssue,
  texts: { readonly notes: NotesCatalog; readonly matters: MattersCatalog },
): string => describeRecordIssue<TodoIssue>(issue, texts.notes, texts.matters.todos);
