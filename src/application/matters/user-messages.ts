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
    case "InvalidHistoryEntryError":
      return { severity: "warning", ...messages.errors.invalidEntry };
    case "InvalidStatusChangeError":
      return { severity: "warning", ...messages.errors.invalidStatusChange };
    case "InvalidDueChangeError":
      return { severity: "warning", ...messages.errors.invalidDueChange };
    case "InvalidSplitError":
      return { severity: "warning", ...messages.errors.invalidSplit };
    case "InvalidMergeError":
      return { severity: "warning", ...messages.errors.invalidMerge };
    case "InvalidTodoError":
      return { severity: "warning", ...messages.todos.error };
    case "InvalidSourceError":
      return { severity: "warning", ...messages.sources.error };
  }
};
