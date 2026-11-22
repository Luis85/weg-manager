import type { AppError } from "../errors";
import type { UserMessage } from "../shell";
import { COMMUNITIES_ERROR_TAGS, type CommunitiesError } from "./errors";
import type { CommunitiesCatalog } from "./i18n/catalog";

/** True for an error of the communities module; `describeError` narrows with it. */
export const isCommunitiesError = (error: AppError): error is CommunitiesError =>
  COMMUNITIES_ERROR_TAGS.has(error._tag);

/**
 * The text of a communities error. `describeError` (`src/application/user-messages.ts`) hands it
 * here. The form shows each issue at its field; this is the summary beside the form.
 */
export const describeCommunitiesError = (
  error: CommunitiesError,
  messages: CommunitiesCatalog,
): UserMessage => {
  switch (error._tag) {
    case "InvalidCommunityError":
      return { severity: "warning", ...messages.errors.invalid };
  }
};
