import { Schema } from "effect";
import { ContactFieldIssue } from "../../domain/contacts";

/**
 * A contact the user wants to save breaks a rule: a field rule of the note type or a rule between
 * records (roles, organisation, the private mark). Nothing was written. The form shows each issue
 * at its field. Its message is empty and nothing logs it.
 */
export class InvalidContactError extends Schema.TaggedError<InvalidContactError>()(
  "InvalidContactError",
  { issues: Schema.Array(ContactFieldIssue) },
) {}

/** Every expected failure of the contacts module. Each needs a text in its describer. */
export type ContactsError = InvalidContactError;

/** One key per member of `ContactsError`; typecheck fails while one is missing or extra. */
export const CONTACTS_ERROR_TAG_KEYS = {
  InvalidContactError: true,
} satisfies Record<ContactsError["_tag"], true>;
