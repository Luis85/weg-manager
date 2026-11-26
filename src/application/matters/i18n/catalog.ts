import type {
  CheckMark,
  DueCheck,
  DueChangeIssue,
  DueKind,
  EntryIssue,
  EntryKind,
  StatusChangeIssue,
  MatterFieldIssue,
  MatterKey,
  MatterKind,
  MatterStatus,
} from "../../../domain/matters";
import type { IssueSentences } from "../../notes";

type Text = { readonly title: string; readonly detail: string };

/**
 * Every text of the matters module the user sees, for one language: the module's part of the
 * app's `Catalog` (`src/application/messages.ts`). Both languages are typed against it.
 */
export type MattersCatalog = {
  /** The frame's navigation entry of the matters screen. */
  readonly route: string;
  readonly screen: {
    readonly title: string;
    intro(folder: string): string;
    readonly add: string;
    readonly loading: string;
    readonly empty: string;
    readonly edit: string;
    editLabel(name: string): string;
    readonly readOnly: string;
    /** The search box and the filters (PBI-05 criterion 3). */
    readonly search: string;
    readonly allTopics: string;
    readonly allStatuses: string;
    readonly allCommunities: string;
    readonly allResponsible: string;
    /** How many matters the filters show of all. */
    shown(count: number, total: number): string;
    readonly noMatch: string;
    /** A card's lines. */
    due(day: string): string;
    readonly noDue: string;
    followUp(day: string): string;
    responsible(name: string): string;
    nextStep(step: string): string;
    readonly sourceGap: string;
  };
  readonly fields: Readonly<Record<MatterKey, string>>;
  readonly kinds: Readonly<Record<MatterKind, string>>;
  readonly statuses: Readonly<Record<MatterStatus, string>>;
  readonly checkMarks: Readonly<Record<CheckMark, string>>;
  readonly dueKinds: Readonly<Record<DueKind, string>>;
  readonly dueChecks: Readonly<Record<DueCheck, string>>;
  /** A card's age of the promise in days (PBI-09 criterion 4). */
  promisedAgo(days: number): string;
  /** The status and due date of a matter being edited: changed only with a reason. */
  readonly locked: {
    readonly title: string;
    readonly hint: string;
  };
  readonly form: {
    readonly createTitle: string;
    readonly editTitle: string;
    readonly save: string;
    readonly cancel: string;
    readonly choose: string;
    /** Beside the number of a new matter: it is given on save. */
    readonly numberHint: string;
    readonly sourceHint: string;
    readonly sourceUnknown: string;
    readonly followUpHint: string;
    /** No contact or no community exists yet. */
    readonly noContacts: string;
    readonly noCommunities: string;
  };
  /** The history of a matter and its status change (PBI-08, PBI-12). */
  readonly history: {
    readonly show: string;
    readonly hide: string;
    showLabel(name: string): string;
    readonly title: string;
    readonly loading: string;
    readonly empty: string;
    readonly kinds: Readonly<Record<EntryKind, string>>;
    readonly board: string;
    readonly unknownDay: string;
    /** An entry's line under its text: kind, who, source, when recorded. */
    meta(kind: string, actor: string, source: string | undefined, recorded: string): string;
    statusTo(status: string): string;
    readonly corrected: string;
    correction(of: string): string;
    readonly unreadable: string;
    readonly add: string;
    readonly addTitle: string;
    readonly kind: string;
    readonly text: string;
    readonly day: string;
    readonly dayHint: string;
    readonly actor: string;
    readonly source: string;
    readonly corrects: string;
    readonly noCorrection: string;
    readonly save: string;
    readonly change: string;
    readonly changeTitle: string;
    readonly to: string;
    readonly reason: string;
    readonly reasonHint: string;
    readonly sourceForClosing: string;
    readonly doneOn: string;
    readonly apply: string;
    readonly cancel: string;
    readonly entryIssues: Readonly<Record<EntryIssue, string>>;
    readonly statusIssues: Readonly<Record<StatusChangeIssue, string>>;
    readonly changeDue: string;
    readonly dueTitle: string;
    readonly dueOn: string;
    readonly dueOnHint: string;
    readonly dueReasonHint: string;
    readonly dueApply: string;
    previous(day: string): string;
    readonly previousNone: string;
    readonly dueIssues: Readonly<Record<DueChangeIssue, string>>;
  };
  readonly missing: Partial<Readonly<Record<MatterKey, string>>>;
  readonly issues: IssueSentences<MatterFieldIssue>;
  readonly errors: {
    readonly invalid: Text;
    readonly invalidEntry: Text;
    readonly invalidStatusChange: Text;
    readonly invalidDueChange: Text;
    readonly invalidSplit: Text;
    readonly invalidMerge: Text;
  };
};
