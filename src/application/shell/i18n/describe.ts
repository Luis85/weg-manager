import type { Settings, SettingsIssue } from "../../../domain/shell";
import type { ShellCatalog } from "./catalog";

/** One domain issue as a sentence of the catalog's language. */
export const describeIssue = (issue: SettingsIssue, messages: ShellCatalog): string => {
  switch (issue.code) {
    case "file.invalid":
      return messages.issues[issue.code](issue);
    case "schema.newer":
      return messages.issues[issue.code](issue);
    case "schema.invalid":
      return messages.issues[issue.code](issue);
    case "greeting.length":
      return messages.issues[issue.code](issue);
    case "logLevel.unknown":
      return messages.issues[issue.code](issue);
  }
};

/** Several issues as one text, in the order they were found. */
export const describeIssues = (issues: readonly SettingsIssue[], messages: ShellCatalog): string =>
  issues.map((issue) => describeIssue(issue, messages)).join(" ");

/** The greeting the user sees: the stored one, or the default of the UI language. */
export const greetingOf = (settings: Settings, messages: ShellCatalog): string =>
  settings.greeting ?? messages.defaultGreeting;
