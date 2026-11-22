import type {
  FieldIssue,
  KindIssueCode,
  NoteNameIssue,
  RecordIssue,
  UnindexedIssue,
  WriteRefusal,
} from "../../../domain/notes";
import type { KeyedIssue } from "../record-list";

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

/** One sentence per reason why a note belongs to no known type; the issue's data fills it. */
type UnindexedIssueTexts = {
  readonly [Code in UnindexedIssue["code"]]: (
    issue: Extract<UnindexedIssue, { code: Code }>,
  ) => string;
};

/** The issue of `Code`: with its data, or (a code that carries none) just its key and code. */
type IssueOf<Issue extends KeyedIssue, Code extends string> = [
  Extract<Issue, { readonly code: Code }>,
] extends [never]
  ? { readonly key: Issue["key"]; readonly code: Code }
  : Extract<Issue, { readonly code: Code }>;

/**
 * One sentence per code of a feature's field issues, filled with the issue's data and the field's
 * label: every code but `field.missing` and the field kinds' codes, which the notes catalog words.
 */
export type IssueSentences<Issue extends KeyedIssue> = {
  readonly [Code in Exclude<Issue["code"], "field.missing" | KindIssueCode>]: (
    issue: IssueOf<Issue, Code>,
    label: string,
  ) => string;
};

/**
 * The texts that word a feature's record issues, in its part of the catalog: the label of each
 * field, what a missing field asks for (else the notes catalog's sentence), and one sentence per
 * code of its own (`describeRecordIssue`).
 */
export type RecordTexts<Issue extends KeyedIssue> = {
  readonly fields: Readonly<Record<Issue["key"], string>>;
  readonly missing?: Partial<Readonly<Record<Issue["key"], string>>>;
  readonly issues: IssueSentences<Issue>;
};

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
    readonly trash: Text;
    readonly editConflict: Text;
    readonly writeRefused: {
      readonly title: string;
      readonly detail: Readonly<Record<WriteRefusal, string>>;
    };
    readonly indexRead: Text;
  };
  /** The notices that confirm a record's write (handoff: Toast, only for short-lived success). */
  readonly notices: {
    created(name: string): string;
    saved(name: string): string;
    deleted(name: string): string;
  };
  readonly recordIssues: RecordIssueTexts;
  readonly fieldIssues: FieldIssueTexts;
  readonly unindexedIssues: UnindexedIssueTexts;
};
