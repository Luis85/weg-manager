import { Effect, Result, Stream } from "effect";
import {
  contactType,
  contactValues,
  parseRole,
  roleEntry,
  validateContact,
  type ContactFieldIssue,
  type ContactInput,
  type ContactValues,
} from "../../domain/contacts";
import { editedValues, type FormDraft } from "../../domain/notes";
import { communityList, communityListChanges } from "../communities";
import type { RecordList } from "../notes";
import { InvalidContactError } from "./errors";
import { contactRecords, shownName, withCommunities, type Contact } from "./list";

/** The ids of the communities a list holds: what a role may name. */
const idsOf = (list: RecordList<{ readonly id: string | undefined }>): ReadonlySet<string> =>
  new Set(list.records.flatMap((community) => (community.id === undefined ? [] : [community.id])));

/** The contacts now, each role checked against the communities. Never suspends. */
export const contactList = Effect.gen(function* () {
  const communities = yield* communityList;
  return withCommunities(yield* contactRecords.list, idsOf(communities));
});

/** The contacts: the current list first, then each change of them or of the communities. */
export const contactListChanges = Stream.zipLatestWith(
  contactRecords.changes,
  communityListChanges,
  (contacts, communities) => withCommunities(contacts, idsOf(communities)),
);

/** What the rules compare with: every other contact and the communities. */
const contextFor = (self: Contact | undefined) =>
  Effect.gen(function* () {
    const contacts = yield* contactRecords.list;
    const communities = yield* communityList;
    return {
      others: contacts.records
        .filter((other) => self === undefined || other.id !== self.id)
        .map((other) => ({ id: other.id, name: shownName(other), kind: other.values.kind })),
      communities: idsOf(communities),
      loaded: self === undefined ? undefined : { name: self.values.name },
    };
  });

/**
 * The values to save (`draft`, by default what the form holds), or the issues why not. Once the
 * rules pass, the contact type reads every field; a value the rules let through and the type
 * rejects would be a bug in the rules, so it is a defect.
 */
const checked = (
  input: ContactInput,
  context: Parameters<typeof validateContact>[1],
  draft: FormDraft<typeof contactType.fields> = contactValues(input),
): Effect.Effect<ContactValues, InvalidContactError> => {
  const issues = validateContact(input, context);
  if (issues.length > 0) return Effect.fail(new InvalidContactError({ issues }));
  const values = contactType.parse(draft);
  return Result.isSuccess(values)
    ? Effect.succeed(values.success)
    : Effect.die(new Error("validateContact passed values the contact type rejects."));
};

/**
 * A new company named `name`, with the roles of the person who works for it; an owner role there
 * becomes `third_party`, because a company is never private (contract DV-02).
 */
const companyInput = (name: string, person: ContactInput): ContactInput => ({
  name,
  kind: "company",
  organization_id: "",
  roles: person.roles.map((entry) => {
    const role = parseRole(entry.trim());
    return role?.role === "owner" ? roleEntry(role.community, "third_party") : entry;
  }),
  email: "",
  phone: "",
  language: "",
  private: false,
  inactive: false,
});

/** A company issue at the person's company field: its name is what the user typed there. */
const atCompanyField = (error: InvalidContactError): InvalidContactError =>
  new InvalidContactError({
    issues: error.issues
      .filter((issue) => issue.key === "name")
      .map((issue): ContactFieldIssue => ({ key: "organization_id", code: issue.code })),
  });

/** What saving a contact may also do: create the company its person names by a new name. */
export type ContactSaveOptions = {
  /** The name of a company that does not exist yet; it is created and linked (PBI-02 crit. 4). */
  readonly newCompany?: string | undefined;
};

/**
 * Creates the company `options.newCompany` names, if any, and returns the input with its id as the
 * person's organisation. The person's own rules run first, so nothing is written for a person the
 * rules refuse.
 */
const withNewCompany = (
  input: ContactInput,
  options: ContactSaveOptions,
  context: Parameters<typeof validateContact>[1],
) =>
  Effect.gen(function* () {
    const name = options.newCompany?.trim() ?? "";
    if (name === "" || input.kind !== "person") return input;
    yield* checked(input, context);
    const company = companyInput(name, input);
    const values = yield* checked(company, { ...context, loaded: undefined }).pipe(
      Effect.mapError(atCompanyField),
    );
    const note = yield* contactRecords.create(values);
    return { ...input, organization_id: String(note.frontmatter["id"]) };
  });

/**
 * Creates a contact (PBI-02): checks the rules against the other contacts and the communities,
 * creates a newly named company first, then writes a note named after the contact into
 * `<rootFolder>/Kontakte/` with a fresh id and an empty body.
 */
export const createContact = (input: ContactInput, options: ContactSaveOptions = {}) =>
  Effect.gen(function* () {
    const context = yield* contextFor(undefined);
    const linked = yield* withNewCompany(input, options, context);
    const values = yield* checked(linked, context);
    return yield* contactRecords.create(values);
  });

/**
 * Saves the form of `contact` (as it was loaded) with `input`. A field left as loaded keeps the
 * note's value as written (`editedValues`); the record kit merges per field with an outside edit
 * and lets the file follow the name. A newly named company is created first.
 */
export const updateContact = (
  contact: Contact,
  input: ContactInput,
  options: ContactSaveOptions = {},
) =>
  Effect.gen(function* () {
    const context = yield* contextFor(contact);
    const linked = yield* withNewCompany(input, options, context);
    const edited = editedValues(contactType, linked, contactValues(linked), contact.frontmatter);
    const values = yield* checked(linked, context, edited);
    return yield* contactRecords.update(contact, values);
  });
