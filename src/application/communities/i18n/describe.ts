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
 * then the action. Issues of the note as a whole are the notes module's; a missing field asks for
 * that field in its own words, and the codes of the community fields and rules are this module's,
 * filled with the issue's data and the field's label.
 */
export const describeCommunityIssue = (issue: CommunityNoteIssue, texts: IssueTexts): string => {
  const label = (key: string) => texts.communities.fields[key as CommunityKey];
  if (!("key" in issue)) return describeNoteIssue(issue, texts.notes, label);
  const words = texts.communities.issues;
  const field = label(issue.key);
  switch (issue.code) {
    case "field.missing":
      return texts.communities.missing[issue.key];
    case "short-code.taken":
      return words[issue.code](issue, field);
    case "short-code.duplicate":
      return words[issue.code](issue, field);
    case "color.unknown":
      return words[issue.code](issue, field);
    case "name.invalid":
      return words[issue.code]({ key: issue.key, code: issue.code }, field);
    case "short-code.invalid":
      return words[issue.code]({ key: issue.key, code: issue.code }, field);
    case "color.taken":
      return words[issue.code]({ key: issue.key, code: issue.code }, field);
    case "kind.invalid":
      return words[issue.code]({ key: issue.key, code: issue.code }, field);
    case "unit-label.invalid":
      return words[issue.code]({ key: issue.key, code: issue.code }, field);
  }
};
