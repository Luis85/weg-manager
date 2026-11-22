import type { SettingsIssue } from "../../domain/shell";
import type { ShellError } from "./errors";
import { ISSUES_URL, type ShellCatalog } from "./i18n/catalog";
import { describeIssues } from "./i18n/describe";

export type UserMessageAction = "retry" | "open-settings" | "copy-diagnostics";

/**
 * What the user sees for any outcome, in the UI language (`messages`): cause, then action
 * (handoff HO-06). Never a stack trace, path, raw error message or note content.
 */
export type UserMessage = {
  readonly severity: "info" | "warning" | "error";
  readonly title: string;
  readonly detail: string;
  /**
   * What the text says once the view that held the user's input is closed, when `detail` talks
   * about that view (a form that keeps the input). `forClosedView` swaps it in.
   */
  readonly detailAfterClose?: string;
  readonly action?: UserMessageAction;
  /** A web page that helps with the message, shown as a link: the plugin's issues (`ISSUES_URL`). */
  readonly link?: string;
};

/**
 * The message for a failure that is reported after the view it belongs to is closed, as a notice
 * (`useCommand`): the text for a closed view where the message has one, and no action, because
 * the retry button was the view's. A message that does not depend on the view stays as it is.
 */
export const forClosedView = (message: UserMessage): UserMessage => {
  const { detailAfterClose, action: _action, ...rest } = message;
  return detailAfterClose === undefined ? message : { ...rest, detail: detailAfterClose };
};

/** The text of a shell error. `describeError` (`src/application/user-messages.ts`) hands it here. */
export const describeShellError = (error: ShellError, messages: ShellCatalog): UserMessage => {
  const { errors } = messages;
  switch (error._tag) {
    case "StorageError":
      return { severity: "error", ...errors.storage, action: "retry" };
    case "ReadOnlySettingsError":
      return {
        severity: "warning",
        title: errors.readOnly.title,
        detail: errors.readOnly.detail[error.reason],
        action: "copy-diagnostics",
        ...(error.reason === "unreadable" ? { link: ISSUES_URL } : {}),
      };
    case "InvalidSettingsError":
      return {
        severity: "warning",
        title: errors.invalidSettings.title,
        detail: describeIssues(error.issues, messages),
      };
    case "VaultReadError":
      return { severity: "error", ...errors.vaultRead, action: "retry" };
    case "ClipboardError":
      return { severity: "error", ...errors.clipboard, action: "retry" };
  }
};

export const describeDefect = (incidentId: string, messages: ShellCatalog): UserMessage => ({
  severity: "error",
  title: messages.defect.title,
  detail: messages.defect.detail(incidentId),
  action: "copy-diagnostics",
  link: ISSUES_URL,
});

export const describeSettingsIssues = (
  issues: readonly SettingsIssue[],
  messages: ShellCatalog,
): UserMessage => ({
  severity: "warning",
  title: messages.settingsReset.title,
  detail: messages.settingsReset.detail(describeIssues(issues, messages)),
  action: "open-settings",
});
