import type { NoteIssue, UnindexedIssue } from "../../../domain/notes";
import type { NotesCatalog } from "./catalog";

/**
 * One issue of a note as a sentence of the catalog's language: first the cause, then the action.
 * A field issue names the field by `label(key)`, which the feature takes from its own catalog. A
 * feature that declares its own field issue codes words them itself.
 */
export const describeNoteIssue = (
  issue: NoteIssue,
  messages: NotesCatalog,
  label: (key: string) => string,
): string => {
  if ("key" in issue) return messages.fieldIssues[issue.code](label(issue.key));
  const texts = messages.recordIssues;
  switch (issue.code) {
    case "schema.malformed":
      return texts[issue.code](issue);
    case "schema.newer":
      return texts[issue.code](issue);
    case "migration.failed":
      return texts[issue.code](issue);
    case "id.missing":
      return texts[issue.code](issue);
    case "id.malformed":
      return texts[issue.code](issue);
    case "id.other-type":
      return texts[issue.code](issue);
    case "id.duplicate":
      return texts[issue.code](issue);
  }
};

/** Why a note belongs to no known note type, as a sentence: first the cause, then the action. */
export const describeUnindexedIssue = (issue: UnindexedIssue, messages: NotesCatalog): string => {
  const texts = messages.unindexedIssues;
  switch (issue.code) {
    case "schema.malformed":
      return texts[issue.code](issue);
    case "schema.unknown-type":
      return texts[issue.code](issue);
    case "frontmatter.unreadable":
      return texts[issue.code](issue);
  }
};
