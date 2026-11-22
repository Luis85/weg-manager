import type { KindIssueCode, NoteIssue, RecordIssue, UnindexedIssue } from "../../../domain/notes";
import type { KeyedIssue } from "../record-list";
import type { NotesCatalog, RecordTexts } from "./catalog";

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

/**
 * One issue of a feature's record or form as a sentence: first the cause, then the action. Issues
 * of the note as a whole and the field kinds' codes are the notes catalog's; a missing field asks
 * in the feature's words where it has them; every other code is the feature's own sentence, filled
 * with the issue's data and the field's label (`RecordTexts`, in the feature's part of the catalog).
 */
export const describeRecordIssue = <Issue extends KeyedIssue>(
  issue: RecordIssue | Issue,
  notes: NotesCatalog,
  texts: RecordTexts<Issue>,
): string => {
  const label = (key: string): string => texts.fields[key as Issue["key"]];
  if (!("key" in issue)) return describeNoteIssue(issue, notes, label);
  const field = label(issue.key);
  if (issue.code === "field.missing") {
    return texts.missing?.[issue.key as Issue["key"]] ?? notes.fieldIssues["field.missing"](field);
  }
  // `IssueSentences` gives each code its sentence; a code without one is a field kind's.
  const sentences = texts.issues as unknown as Readonly<
    Record<string, ((issue: Issue, label: string) => string) | undefined>
  >;
  const sentence = sentences[issue.code];
  return sentence === undefined
    ? notes.fieldIssues[issue.code as KindIssueCode](field)
    : sentence(issue, field);
};
