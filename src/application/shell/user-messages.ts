import type { SettingsIssue } from "../../domain/shell/settings";
import type { AppError } from "./errors";
import { describeIssues, type Catalog } from "./i18n";

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
};

export const describeError = (error: AppError, messages: Catalog): UserMessage => {
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

export const describeDefect = (incidentId: string, messages: Catalog): UserMessage => ({
  severity: "error",
  title: messages.defect.title,
  detail: messages.defect.detail(incidentId),
  action: "copy-diagnostics",
});

export const describeSettingsIssues = (
  issues: readonly SettingsIssue[],
  messages: Catalog,
): UserMessage => ({
  severity: "warning",
  title: messages.settingsReset.title,
  detail: messages.settingsReset.detail(describeIssues(issues, messages)),
  action: "open-settings",
});
