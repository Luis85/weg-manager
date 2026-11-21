import type { CommunityKey } from "../../../domain/communities";
import { describeNoteIssue, type NotesCatalog } from "../../notes";
import type { CommunityNoteIssue } from "../list";
import type { CommunitiesCatalog } from "./catalog";

/** The parts of the app's catalog that word a community's issues. */
type IssueTexts = {
  readonly notes: NotesCatalog;
  readonly communities: CommunitiesCatalog;
};

/**
 * One issue of a community note or form as a sentence of the catalog's language: first the cause,
 * then the action. Issues of the note as a whole and `field.missing` are the notes module's; the
 * codes of the community fields and rules are this module's. Each names its field by its label.
 */
export const describeCommunityIssue = (issue: CommunityNoteIssue, texts: IssueTexts): string => {
  const label = (key: string) => texts.communities.fields[key as CommunityKey];
  if (!("key" in issue)) return describeNoteIssue(issue, texts.notes, label);
  if (issue.code === "field.missing") return texts.notes.fieldIssues[issue.code](label(issue.key));
  return texts.communities.issues[issue.code](label(issue.key));
};
