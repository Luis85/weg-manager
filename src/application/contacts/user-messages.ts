import type { UserMessage } from "../shell";
import type { ContactsError } from "./errors";
import type { ContactsCatalog } from "./i18n/catalog";

/**
 * The text of a contacts error. `describeError` (`src/application/user-messages.ts`) hands it
 * here. The form shows each issue at its field; this is the summary beside the form.
 */
export const describeContactsError = (
  error: ContactsError,
  messages: ContactsCatalog,
): UserMessage => {
  switch (error._tag) {
    case "InvalidContactError":
      return { severity: "warning", ...messages.errors.invalid };
  }
};
