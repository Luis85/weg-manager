import { Effect } from "effect";
import { de, describeIssues } from "./i18n";
import { HostInfo, Logger, Messages, type RecordedLogEntry } from "./ports";
import { RECENT_LOG_LIMIT } from "./logger";
import { SettingsService } from "./settings-service";

/**
 * One log entry as report text. Only typed values reach it: the event name, counts and flags,
 * the error's name and its sanitised frames. The error message never does (B-NFR-07).
 */
const formatEntry = (entry: RecordedLogEntry): string => {
  const parts = [new Date(entry.at).toISOString(), entry.level.toUpperCase(), entry.event];
  if (entry.incidentId !== undefined) parts.push(`(${entry.incidentId})`);
  if (entry.data !== undefined) parts.push(JSON.stringify(entry.data));
  if (entry.error !== undefined) parts.push(entry.error.name);
  return [parts.join(" "), ...(entry.error?.frames ?? []).map((frame) => `    ${frame}`)].join(
    "\n",
  );
};

/**
 * A plain-text report the user can paste into a support request. It stays German in every UI
 * language, so support reads one format (ADR 0005); `Sprache` names the UI language.
 */
export const buildDiagnostics = Effect.gen(function* () {
  const host = yield* HostInfo;
  const { language } = yield* Messages;
  const settings = yield* SettingsService;
  const status = yield* settings.status;
  const current = yield* settings.current;
  const entries = (yield* (yield* Logger).recent).slice(-RECENT_LOG_LIMIT);
  return [
    "WEG Manager – Diagnose",
    `Plugin-Version: ${host.pluginVersion}`,
    `Obsidian-API: ${host.apiVersion}`,
    `Plattform: ${host.platform}`,
    `Sprache: ${language}`,
    `Einstellungen beschreibbar: ${status.writable ? "ja" : "nein"}${status.readOnlyReason ? ` (${status.readOnlyReason})` : ""}`,
    `Hinweise zu Einstellungen: ${status.issues.length > 0 ? describeIssues(status.issues, de) : "keine"}`,
    `Protokollstufe: ${current.logLevel}`,
    `Letzte Protokolleinträge (${entries.length}):`,
    ...entries.map(formatEntry),
  ].join("\n");
});
