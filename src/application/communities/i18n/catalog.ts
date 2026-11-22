import type {
  CommunityColor,
  CommunityFieldIssue,
  CommunityKey,
  KindPair,
} from "../../../domain/communities";

type Text = { readonly title: string; readonly detail: string };

/** One sentence per issue code of this module; the issue's data and the field's label fill it. */
type IssueTexts = {
  readonly [Code in Exclude<CommunityFieldIssue["code"], "field.missing">]: (
    issue: IssueOf<Code>,
    label: string,
  ) => string;
};

/** The issue of `Code`: with its data, or (a code that carries none) just its key and code. */
type IssueOf<Code extends string> =
  Extract<CommunityFieldIssue, { code: Code }> extends never
    ? { readonly key: CommunityKey; readonly code: Code }
    : Extract<CommunityFieldIssue, { code: Code }>;

/**
 * Every text of the communities module the user sees, for one language: the module's part of the
 * app's `Catalog` (`src/application/messages.ts`). Both languages are typed against it.
 */
export type CommunitiesCatalog = {
  /** The frame's navigation entry of the communities screen. */
  readonly route: string;
  readonly screen: {
    readonly title: string;
    /** The section's introduction: where the notes live (`folder` is the vault path). */
    intro(folder: string): string;
    readonly add: string;
    readonly loading: string;
    /** One sentence on what appears here, beside the create action. */
    readonly empty: string;
    readonly edit: string;
    readonly remove: string;
    /** Accessible names of a community's buttons. */
    editLabel(name: string): string;
    removeLabel(name: string): string;
    readonly readOnly: string;
    /** The marker on the card of the selected community (glossary: community selection). */
    readonly selected: string;
    /** What a list row shows under the name: kind and unit label. */
    summary(kind: string, unitLabel: string): string;
    /** WEG Manager notes that are no community record, listed on this screen for now. */
    readonly otherNotes: string;
    /** The action that opens a note in another Obsidian tab, and its accessible name. */
    readonly openNote: string;
    openNoteLabel(name: string): string;
  };
  /** The label of each field, also used to word its issues. */
  readonly fields: Readonly<Record<CommunityKey, string>>;
  /** What a badge shows for a community without a valid short code. */
  readonly noShortCode: string;
  /** Beside the short code: its form on create, that it stays fixed on edit. */
  readonly shortCodeHint: string;
  readonly shortCodeFixed: string;
  /** Below the unit label: what it means. */
  readonly unitLabelHelp: string;
  readonly colors: Readonly<Record<CommunityColor, string>>;
  /** The accessible name of a colour another community uses. */
  colorTaken(color: string): string;
  /** The caption of the badge that shows the chosen short code on the chosen colour. */
  readonly preview: string;
  /** The pairs the form always suggests, in the UI language. */
  readonly builtInKinds: readonly KindPair[];
  /** The visible caption of the kind suggestions. */
  readonly suggestions: string;
  suggestion(pair: KindPair): string;
  readonly form: {
    readonly createTitle: string;
    readonly editTitle: string;
    readonly save: string;
    readonly cancel: string;
  };
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
  readonly deletion: {
    readonly title: string;
    detail(name: string): string;
    readonly confirm: string;
    readonly cancel: string;
  };
  /** The community switch in the frame. */
  readonly switcher: {
    readonly label: string;
    readonly loading: string;
    readonly choose: string;
    readonly none: string;
    /** Communities exist, but each has an issue: none can be chosen. */
    readonly unavailable: string;
  };
  /** What a missing field asks for, per field. */
  readonly missing: Readonly<Record<CommunityKey, string>>;
  /** One sentence per issue code of this module. */
  readonly issues: IssueTexts;
  /** The notices that confirm a write (handoff: Toast, only for short-lived success). */
  readonly notices: {
    created(name: string): string;
    saved(name: string): string;
    deleted(name: string): string;
  };
  readonly errors: { readonly invalid: Text };
};
