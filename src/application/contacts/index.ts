// The public face of the contacts module's application layer (ADR 0006): other layers and the
// composition files import only this.
export { InvalidContactError } from "./errors";
export { describeContactIssue } from "./i18n/describe";
export { contactNames, shownName, type Contact } from "./list";
export { contactsModule } from "./module";
export { CONTACTS } from "./routes";
export { contactList, contactListChanges, createContact, updateContact } from "./use-cases";
export { describeContactsError } from "./user-messages";
