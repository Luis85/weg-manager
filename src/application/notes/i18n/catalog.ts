import type { FieldIssue, NoteNameIssue, RecordIssue, WriteRefusal } from "../../../domain/notes";

type Text = { readonly title: string; readonly detail: string };

/** One sentence per issue of a note as a whole; the issue's data fills the parameters. */
type RecordIssueTexts = {
  readonly [Code in RecordIssue["code"]]: (issue: Extract<RecordIssue, { code: Code }>) => string;
};

/**
 * One sentence per issue of a field, with the field's label: labels belong to the feature's
 * catalog, so the feature hands its label in.
 */
type FieldIssueTexts = { readonly [Code in FieldIssue["code"]]: (label: string) => string };

/**
 * Every text of the notes module the user sees, for one language: the module's part of the app's
 * `Catalog` (`src/application/messages.ts`). Both languages are typed against it.
 */
export type NotesCatalog = {
  readonly errors: {
    readonly notFound: Text;
    readonly pathTaken: Text;
    readonly invalidName: {
      readonly title: string;
      readonly detail: Readonly<Record<NoteNameIssue, string>>;
    };
    readonly unreadable: Text;
    readonly write: Text;
    readonly editConflict: Text;
    readonly writeRefused: {
      readonly title: string;
      readonly detail: Readonly<Record<WriteRefusal, string>>;
    };
  };
  readonly recordIssues: RecordIssueTexts;
  readonly fieldIssues: FieldIssueTexts;
};
