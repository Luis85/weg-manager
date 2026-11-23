import { contactType } from "../../domain/contacts";
import { defineModule } from "../module";
import { CONTACTS_ERROR_TAG_KEYS } from "./errors";
import { contactsDe } from "./i18n/de";
import { contactsEn } from "./i18n/en";
import { ContactsRoute } from "./routes";
import { describeContactsError } from "./user-messages";

/**
 * The contacts module's application side (ADR 0006, PBI-02): the contact note type, its screen
 * with the list and the form, its texts and its errors. It comes after `communities`, whose list
 * its roles are checked against.
 */
export const contactsModule = defineModule({
  name: "contacts",
  catalog: { de: contactsDe, en: contactsEn },
  errors: { tags: CONTACTS_ERROR_TAG_KEYS, describe: describeContactsError },
  noteTypes: [contactType],
  routes: [ContactsRoute],
});
