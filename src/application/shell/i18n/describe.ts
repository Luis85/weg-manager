import type { SettingsIssue } from "../../../domain/shell";
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
    case "migration.failed":
      return messages.issues[issue.code](issue);
    case "logLevel.unknown":
      return messages.issues[issue.code](issue);
    case "rootFolder.invalid":
      return messages.issues[issue.code](issue);
  }
};

/** Several issues as one text, in the order they were found. */
export const describeIssues = (issues: readonly SettingsIssue[], messages: ShellCatalog): string =>
  issues.map((issue) => describeIssue(issue, messages)).join(" ");
