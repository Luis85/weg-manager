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
  /** The action that opens a note in another Obsidian tab, and its accessible name. */
  readonly openNote: { readonly label: string; labelFor(name: string): string };
  /** The per-field choice after an outside edit (ADR 0007). */
  readonly conflict: {
    readonly title: string;
    readonly detail: string;
    loaded(value: string): string;
    mine(value: string): string;
    theirs(value: string): string;
    readonly apply: string;
    /** How an unset value is shown. */
    readonly empty: string;
  };
  /** The dialog that asks before a record goes to the trash; its title is the feature's. */
  readonly deletion: {
    detail(name: string): string;
    readonly confirm: string;
    readonly cancel: string;
  };
  /**
   * The settings section of the notes the plugin cannot read or assign to a record type
   * (glossary: data issues): its name in the navigation and as its heading.
   */
  readonly dataIssues: {
    readonly title: string;
    readonly intro: string;
    readonly loading: string;
    /** There are none. */
    readonly none: string;
    /** The heading of their list: WEG Manager notes that are no record. */
    readonly otherNotes: string;
    /** The badge's number in words, for screen readers. */
    count(notes: number): string;
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
