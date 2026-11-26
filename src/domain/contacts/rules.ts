import { Schema } from "effect";
import { draftValues, fitsFileName, type FormDraft, type FormInput } from "../notes";
import {
  ROLE_ENTRY,
  contactType,
  type ContactFields,
  type ContactKey,
  type ContactKind,
  type ContactRole,
} from "./contact-type";

/** What the contact form holds: each field in the form of its kind. */
export type ContactInput = FormInput<ContactFields>;

/** The values a form saves: trimmed, blank as unset, a flag only when set. */
export type ContactDraft = FormDraft<ContactFields>;

/** The issue codes whose sentence needs nothing but the field's label. */
const ContactIssueCode = Schema.Literals([
  "field.missing",
  "field.reference",
  "field.checkbox",
  "name.invalid",
  "name.too-long",
  "kind.unknown",
  "organization.not-company",
  "roles.invalid",
  "roles.missing",
  "roles.duplicate-community",
  "roles.community-missing",
  "email.invalid",
  "phone.invalid",
  "language.unknown",
  "private.missing",
]);

/**
 * One field's issue, language-free (ADR 0005): the codec's codes and the rules between records
 * (PBI-02, contract DV-02).
 */
export const ContactFieldIssue = Schema.Struct({
  key: Schema.Literals(contactType.keys),
  code: ContactIssueCode,
});
export type ContactFieldIssue = typeof ContactFieldIssue.Type;

/** What the rules need to know of another contact. */
export type OtherContact = {
  readonly id: string | undefined;
  readonly name: string;
  readonly kind?: ContactKind | undefined;
};

export type ContactRuleContext = {
  /** The other contacts; the edited one is not among them. */
  readonly others: readonly OtherContact[];
  /** The ids of the communities a role may name; without them, no role is checked for it. */
  readonly communities?: ReadonlySet<string> | undefined;
  /** The values the edited contact had when the form loaded it. */
  readonly loaded?: { readonly name?: string | undefined } | undefined;
};

/** The community and the role of one `roles` entry, or `undefined` for no valid entry. */
export const parseRole = (
  entry: string,
): { readonly community: string; readonly role: ContactRole } | undefined => {
  const match = ROLE_ENTRY.exec(entry);
  return match === null
    ? undefined
    : { community: match[1] as string, role: match[2] as ContactRole };
};

/** Whether `roles` holds the role `owner` in any community: such a contact is private. */
export const hasOwnerRole = (roles: readonly string[] | undefined): boolean =>
  (roles ?? []).some((entry) => parseRole(entry)?.role === "owner");

/** The values a form saves from what it holds: texts trimmed, a flag that is off left out. */
export const contactValues = (input: ContactInput): ContactDraft => {
  const draft = draftValues(contactType, input);
  return {
    ...draft,
    private: draft.private === true ? true : undefined,
    inactive: draft.inactive === true ? true : undefined,
  };
};

/** The values the rules between records read. */
type RuleValues = {
  readonly kind?: string | undefined;
  readonly organization_id?: string | undefined;
  readonly roles?: readonly string[] | undefined;
  readonly private?: boolean | undefined;
};

const rolesIssue = (
  roles: readonly string[],
  context: ContactRuleContext,
): ContactFieldIssue | undefined => {
  if (roles.length === 0) return { key: "roles", code: "roles.missing" };
  const parsed = roles.map(parseRole);
  const communities = parsed.flatMap((role) => (role === undefined ? [] : [role.community]));
  if (new Set(communities).size < communities.length) {
    return { key: "roles", code: "roles.duplicate-community" };
  }
  const known = context.communities;
  return known !== undefined && communities.some((community) => !known.has(community))
    ? { key: "roles", code: "roles.community-missing" }
    : undefined;
};

const organizationIssue = (
  values: RuleValues,
  context: ContactRuleContext,
): ContactFieldIssue | undefined => {
  if (values.organization_id === undefined) return undefined;
  if (values.kind === "company")
    return { key: "organization_id", code: "organization.not-company" };
  const target = context.others.find((other) => other.id === values.organization_id);
  return target !== undefined && target.kind !== "company"
    ? { key: "organization_id", code: "organization.not-company" }
    : undefined;
};

/**
 * The rules beyond each field (PBI-02, DV-02): at least one role and one per community, each in a
 * community that exists; an organisation only for a person and only a company; an owner marked
 * private. A reference to no known contact is the index's `reference.missing`, not a rule here.
 * In key order, at most one issue per key.
 */
export const contactRuleIssues = (
  values: RuleValues,
  context: ContactRuleContext,
): readonly ContactFieldIssue[] => {
  const issues: (ContactFieldIssue | undefined)[] = [
    organizationIssue(values, context),
    values.roles === undefined ? undefined : rolesIssue(values.roles, context),
    hasOwnerRole(values.roles) && values.private !== true
      ? { key: "private", code: "private.missing" }
      : undefined,
  ];
  return issues.filter((issue) => issue !== undefined);
};

/**
 * The rules a contact must meet to be saved: the field rules of the note type, a name that fits a
 * file name (unless the contact had it), then the rules between records. At most one issue per
 * field, field rules first. The form's validators and the use cases call it.
 */
export const validateContact = (
  input: ContactInput,
  context: ContactRuleContext,
): readonly ContactFieldIssue[] => {
  const draft = contactValues(input);
  const issues: ContactFieldIssue[] = contactType
    .check(draft)
    // `check` reports the type's own keys only.
    .map((issue) => ({ key: issue.key as ContactKey, code: issue.code }));
  const name = draft.name;
  if (
    name !== undefined &&
    name !== context.loaded?.name &&
    !issues.some((issue) => issue.key === "name") &&
    !fitsFileName(name, "Kontakt")
  ) {
    issues.push({ key: "name", code: "name.too-long" });
  }
  const broken = new Set(issues.map((issue) => issue.key));
  for (const issue of contactRuleIssues(draft, context)) {
    if (!broken.has(issue.key)) issues.push(issue);
  }
  return issues;
};

/** The other contacts named like `name` (case and blanks aside): shown before a save. */
export const sameNameContacts = (
  name: string,
  others: readonly OtherContact[],
  self?: string,
): readonly OtherContact[] => {
  const wanted = name.trim().toLocaleLowerCase("de");
  if (wanted === "") return [];
  return others.filter(
    (other) => other.id !== self && other.name.trim().toLocaleLowerCase("de") === wanted,
  );
};
