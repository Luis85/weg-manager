// The public face of the contacts domain (ADR 0006): other modules and layers import only this.
export {
  CONTACT_KINDS,
  CONTACT_LANGUAGES,
  CONTACT_ROLES,
  NAME_MAX_LENGTH,
  ROLE_ENTRY,
  contactType,
  roleEntry,
  type ContactFields,
  type ContactKey,
  type ContactKind,
  type ContactLanguage,
  type ContactRole,
  type ContactValues,
} from "./contact-type";
export {
  ContactFieldIssue,
  contactRuleIssues,
  contactValues,
  hasOwnerRole,
  parseRole,
  sameNameContacts,
  validateContact,
  type ContactDraft,
  type ContactInput,
  type ContactRuleContext,
  type OtherContact,
} from "./rules";
