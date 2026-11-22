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
  readonly action?: UserMessageAction;
  /** A web page that helps with the message, shown as a link: the plugin's issues (`ISSUES_URL`). */
  readonly link?: string;
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
