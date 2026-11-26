import type {
  CheckMark,
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
  readonly missing: Partial<Readonly<Record<MatterKey, string>>>;
  readonly issues: IssueSentences<MatterFieldIssue>;
  readonly errors: { readonly invalid: Text };
};
