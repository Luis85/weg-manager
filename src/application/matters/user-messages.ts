import type { UserMessage } from "../shell";
import type { MattersError } from "./errors";
import type { MattersCatalog } from "./i18n/catalog";

/** The text of a matters error; the form shows each issue at its field, this is the summary. */
export const describeMattersError = (
  error: MattersError,
  messages: MattersCatalog,
): UserMessage => {
  switch (error._tag) {
    case "InvalidMatterError":
      return { severity: "warning", ...messages.errors.invalid };
  }
};
