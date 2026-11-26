import {
  contactRuleIssues,
  contactType,
  type ContactFieldIssue,
  type ContactFields,
} from "../../domain/contacts";
import type { MissingReference, RecordIssue } from "../../domain/notes";
import { defineRecords, type RecordList, type RecordRow } from "../notes";

/** An issue of a contact field: the codec's, the rules', or a missing organisation. */
export type ContactIssue =
  | ContactFieldIssue
  // The one reference field: the index adds `reference.missing` only there.
  | (MissingReference & { readonly key: "organization_id" });

/** An issue of a contact note: of the note as a whole, or of one field (by key). */
export type ContactNoteIssue = RecordIssue | ContactIssue;

/** One contact note as the screen shows it. */
export type Contact = RecordRow<ContactFields, ContactIssue>;

/** What the rules need of the other contacts of a list. */
const othersOf = (contacts: readonly Contact[], self: Contact, shownName: (c: Contact) => string) =>
  contacts
    .filter((other) => other !== self)
    .map((other) => ({ id: other.id, name: shownName(other), kind: other.values.kind }));

/** `extra` on `contact`, except where a field already has an issue: one issue per field. */
const withIssues = (contact: Contact, extra: readonly ContactFieldIssue[]): Contact => {
  const keys = new Set(contact.issues.flatMap((issue) => ("key" in issue ? [issue.key] : [])));
  const added = extra.filter((issue) => !keys.has(issue.key));
  return added.length === 0 ? contact : { ...contact, issues: [...contact.issues, ...added] };
};

/**
 * The rules between contacts on every editable row (PBI-02, DV-02): roles, the organisation, the
 * private mark. Whether a role's community exists needs the communities, so `withCommunities`
 * adds that.
 */
const markRules = (contacts: readonly Contact[], shownName: (c: Contact) => string): Contact[] =>
  contacts.map((contact) =>
    contact.editable
      ? withIssues(
          contact,
          contactRuleIssues(contact.values, { others: othersOf(contacts, contact, shownName) }),
        )
      : contact,
  );

/**
 * The contact records (ADR 0007): named and filed by their name, `Kontakt` when the name leaves no
 * usable file name. The list marks the rules between contacts; create and update come from the
 * notes module's record kit. Contacts are never deleted (owner decision 23.11.2026).
 */
export const contactRecords = defineRecords({
  type: contactType,
  title: "name",
  fallbackName: () => "Kontakt",
  log: "contacts",
  issue: (issue): ContactIssue => issue as ContactIssue,
  between: markRules,
});

/** `roles.community-missing` on each contact with a role in a community that is not in `ids`. */
export const withCommunities = (
  list: RecordList<Contact>,
  ids: ReadonlySet<string>,
): RecordList<Contact> => ({
  ...list,
  records: list.records.map((contact) =>
    contact.editable
      ? withIssues(contact, contactRuleIssues(contact.values, { others: [], communities: ids }))
      : contact,
  ),
});

/** The name a list shows: the contact's name, else its file name. */
export const shownName = contactRecords.shownName;

/** The contacts' names by id, for a reference to a contact (the company of a person). */
export const contactNames = {
  names: contactRecords.names,
  nameChanges: contactRecords.nameChanges,
};
