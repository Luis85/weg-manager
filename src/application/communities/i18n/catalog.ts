import type {
  CommunityColor,
  CommunityFieldIssue,
  CommunityKey,
  KindPair,
} from "../../../domain/communities";
import type { IssueSentences } from "../../notes";

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
    /** The marker on the card of the selected community (glossary: community selection). */
    readonly selected: string;
    /** What a list row shows under the name: kind and unit label. */
    summary(kind: string, unitLabel: string): string;
  };
  /** The label of each field, also used to word its issues. */
  readonly fields: Readonly<Record<CommunityKey, string>>;
  /** What a badge shows for a community without a valid short code. */
  readonly noShortCode: string;
  /** Beside the short code: the form it takes. */
  readonly shortCodeHint: string;
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
  /** The title of the dialog that asks before a community goes to the trash. */
  readonly deletion: { readonly title: string };
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
  /** One sentence per issue code of this module; the issue's data and the field's label fill it. */
  readonly issues: IssueSentences<CommunityFieldIssue>;
  readonly errors: { readonly invalid: Text };
};
