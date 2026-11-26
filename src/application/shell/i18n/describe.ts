import type { SettingsIssue } from "../../../domain/shell";
import type { ShellCatalog } from "./catalog";

/**
 * One domain issue as a sentence of the catalog's language. `messages.issues` has one sentence per
 * code (the catalog's type requires it); TypeScript cannot tie a code to its own issue type in a
 * lookup, so the sentence is read for the general issue.
 */
export const describeIssue = (issue: SettingsIssue, messages: ShellCatalog): string =>
  (messages.issues[issue.code] as (issue: SettingsIssue) => string)(issue);

/** Several issues as one text, in the order they were found. */
export const describeIssues = (issues: readonly SettingsIssue[], messages: ShellCatalog): string =>
  issues.map((issue) => describeIssue(issue, messages)).join(" ");
