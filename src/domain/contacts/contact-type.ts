import { Schema } from "effect";
import {
  checkbox,
  defineNoteType,
  lineOfText,
  list,
  reference,
  required,
  text,
  type RecordValues,
} from "../notes";

/** Whether a contact is a person or a company (PBI-02). */
export const CONTACT_KINDS = ["person", "company"] as const;
export type ContactKind = (typeof CONTACT_KINDS)[number];

/**
 * What a contact is in one community, a closed list (ENT-02, owner decision 23.11.2026). A role
 * gives no authority (DF-01).
 */
export const CONTACT_ROLES = [
  "board",
  "deputy",
  "owner",
  "manager",
  "other_board",
  "third_party",
  "agent",
] as const;
export type ContactRole = (typeof CONTACT_ROLES)[number];

/** The languages a contact gets messages in. */
export const CONTACT_LANGUAGES = ["de", "de+en"] as const;
export type ContactLanguage = (typeof CONTACT_LANGUAGES)[number];

/** The longest name; it is also the file name. */
export const NAME_MAX_LENGTH = 100;

const EMAIL_MAX_LENGTH = 254;
const PHONE_MAX_LENGTH = 50;

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";

/** One entry of `roles`: the id of a community, a colon, a role. */
export const ROLE_ENTRY = new RegExp(`^(community-${UUID}):(${CONTACT_ROLES.join("|")})$`);

/** One text, one `@`, text on both sides, no blank. */
const EMAIL = /^[^@\s]+@[^@\s]+$/;

/** The entry of `roles` for `role` in the community with id `community`. */
export const roleEntry = (community: string, role: ContactRole): string => `${community}:${role}`;

/**
 * The contact note, `weg-manager.contact/v1` (ADR 0007, PBI-02; contract page
 * `docs/contracts/DV-02 - Kontakt v1.md`). A person or a company with at least one role per
 * community it works in; contact data, language and the flags are optional. New notes go to
 * `<rootFolder>/Kontakte/`.
 */
export const contactType = defineNoteType({
  type: "contact",
  version: 1,
  folder: "Kontakte",
  fields: {
    name: required(text({ schema: lineOfText(NAME_MAX_LENGTH), issue: "name.invalid" })),
    kind: required(text({ schema: Schema.Literals(CONTACT_KINDS), issue: "kind.unknown" })),
    organization_id: reference("contact"),
    roles: required(
      list({
        schema: Schema.Array(Schema.String.check(Schema.isPattern(ROLE_ENTRY))),
        issue: "roles.invalid",
      }),
    ),
    email: text({
      schema: lineOfText(EMAIL_MAX_LENGTH).check(Schema.isPattern(EMAIL)),
      issue: "email.invalid",
    }),
    phone: text({ schema: lineOfText(PHONE_MAX_LENGTH), issue: "phone.invalid" }),
    language: text({ schema: Schema.Literals(CONTACT_LANGUAGES), issue: "language.unknown" }),
    private: checkbox(),
    inactive: checkbox(),
  },
  migrations: {},
});

export type ContactFields = typeof contactType.fields;

/** The key of a contact note's field. */
export type ContactKey = (typeof contactType.keys)[number];

/** A contact's values as a form saves them. */
export type ContactValues = RecordValues<ContactFields>;
