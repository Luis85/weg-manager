import type {
  ContactFieldIssue,
  ContactKey,
  ContactKind,
  ContactLanguage,
  ContactRole,
} from "../../../domain/contacts";
import type { IssueSentences } from "../../notes";

type Text = { readonly title: string; readonly detail: string };

/**
 * Every text of the contacts module the user sees, for one language: the module's part of the
 * app's `Catalog` (`src/application/messages.ts`). Both languages are typed against it.
 */
export type ContactsCatalog = {
  /** The frame's navigation entry of the contacts screen. */
  readonly route: string;
  readonly screen: {
    readonly title: string;
    /** The screen's introduction: where the notes live (`folder` is the vault path). */
    intro(folder: string): string;
    readonly add: string;
    readonly loading: string;
    /** One sentence on what appears here, beside the create action. */
    readonly empty: string;
    readonly edit: string;
    /** Accessible name of a contact's edit button. */
    editLabel(name: string): string;
    readonly readOnly: string;
    /** The switch that shows inactive contacts too. */
    readonly showInactive: string;
    /** How many inactive contacts the list hides. */
    hiddenInactive(count: number): string;
    /** The markers on a card. */
    readonly private: string;
    readonly inactive: string;
    /** A person's company, under the name. */
    worksFor(company: string): string;
    /** A company's people, under the name. */
    people(names: string): string;
    /** One role of a contact: the role in the community (its short code). */
    roleIn(role: string, community: string): string;
  };
  /** The label of each field, also used to word its issues. */
  readonly fields: Readonly<Record<ContactKey, string>>;
  readonly kinds: Readonly<Record<ContactKind, string>>;
  readonly roles: Readonly<Record<ContactRole, string>>;
  readonly languages: Readonly<Record<ContactLanguage, string>>;
  readonly form: {
    readonly createTitle: string;
    readonly editTitle: string;
    readonly save: string;
    readonly cancel: string;
    /** The roles editor. */
    readonly community: string;
    readonly role: string;
    readonly addRole: string;
    removeRole(community: string): string;
    readonly noRole: string;
    /** No community exists yet, so no role can be given. */
    readonly noCommunities: string;
    /** The company field of a person. */
    readonly noCompany: string;
    readonly newCompany: string;
    readonly newCompanyName: string;
    readonly newCompanyHint: string;
    readonly noLanguage: string;
    /** Beside the private mark while an owner role keeps it on. */
    readonly privateLocked: string;
    readonly privateHelp: string;
    readonly inactiveHelp: string;
    /** Shown before a save when other contacts have the same name (PBI-02 criterion 5). */
    sameName(names: string): string;
  };
  /** What a missing field asks for, per field. */
  readonly missing: Partial<Readonly<Record<ContactKey, string>>>;
  /** One sentence per issue code of this module; the field's label fills it. */
  readonly issues: IssueSentences<ContactFieldIssue>;
  readonly errors: { readonly invalid: Text };
};
