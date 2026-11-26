import type { UserMessage } from "../shell";
import type { WeekError } from "./errors";
import type { WeekCatalog } from "./i18n/catalog";

/** The text of a week error. */
export const describeWeekError = (error: WeekError, messages: WeekCatalog): UserMessage => {
  switch (error._tag) {
    case "WeekChangedError":
      return { severity: "warning", ...messages.errors.changed };
  }
};
