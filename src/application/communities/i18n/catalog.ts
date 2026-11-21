import type {
  CommunityColor,
  CommunityIssueCode,
  CommunityKey,
  KindPair,
} from "../../../domain/communities";

type Text = { readonly title: string; readonly detail: string };

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
    /** What a list row shows under the name: kind and unit label. */
    summary(kind: string, unitLabel: string): string;
    /** Notes that belong to no known type, listed on this screen for now. */
    readonly problems: string;
  };
  /** The label of each field, also used to word its issues. */
  readonly fields: Readonly<Record<CommunityKey, string>>;
  readonly shortCodeHint: string;
  readonly shortCodeFixed: string;
  readonly colors: Readonly<Record<CommunityColor, string>>;
  /** The accessible name of a colour another community uses. */
  colorTaken(color: string): string;
  /** The pairs the form always suggests, in the UI language. */
  readonly builtInKinds: readonly KindPair[];
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
    readonly mine: string;
    readonly theirs: string;
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
    readonly choose: string;
    readonly none: string;
  };
  /** One sentence per issue code of this module, with the field's label. */
  readonly issues: Readonly<
    Record<Exclude<CommunityIssueCode, "field.missing">, (label: string) => string>
  >;
  readonly errors: { readonly invalid: Text };
};
