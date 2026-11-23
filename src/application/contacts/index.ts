// The public face of the contacts module's application layer (ADR 0006): other layers and the
// composition files import only this.
export { InvalidContactError } from "./errors";
export type { ContactsCatalog } from "./i18n/catalog";
export { contactsDe } from "./i18n/de";
export { describeContactIssue } from "./i18n/describe";
export { contactsEn } from "./i18n/en";
export {
  contactNames,
  shownName,
  type Contact,
  type ContactIssue,
  type ContactNoteIssue,
} from "./list";
export { contactsModule } from "./module";
export { CONTACTS, ContactsRoute } from "./routes";
export {
  contactList,
  contactListChanges,
  createContact,
  updateContact,
  type ContactSaveOptions,
} from "./use-cases";
export { describeContactsError } from "./user-messages";
