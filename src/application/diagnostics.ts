import { Effect } from "effect";
import { HostInfo, Logger, type RecordedLogEntry } from "./ports";
import { RECENT_LOG_LIMIT } from "./logger";
import { SettingsService } from "./settings-service";

export const REDACTED = "[redacted]";
const SENSITIVE_KEYS = new Set(["content", "body", "text", "path", "name"]);
const MAX_STRING = 200;

/** Removes anything that could contain note content or identify files before it leaves the plugin. */
export const redact = (value: unknown, key?: string): unknown => {
  if (key !== undefined && SENSITIVE_KEYS.has(key)) return REDACTED;
  if (typeof value === "string") return value.length > MAX_STRING ? REDACTED : value;
  if (Array.isArray(value)) return value.map((item) => redact(item));
  if (typeof value === "object" && value !== null) {
    return Object.fromEntries(
      Object.entries(value).map(([name, inner]) => [name, redact(inner, name)]),
    );
  }
  return value;
};

const formatEntry = (entry: RecordedLogEntry): string => {
  const parts = [new Date(entry.at).toISOString(), entry.level.toUpperCase(), entry.event];
  if (entry.incidentId !== undefined) parts.push(`(${entry.incidentId})`);
  if (entry.context !== undefined) parts.push(JSON.stringify(redact(entry.context)));
  return parts.join(" ");
};

/** A plain-text report the user can paste into a support request. */
export const buildDiagnostics = Effect.gen(function* () {
  const host = yield* HostInfo;
  const settings = yield* SettingsService;
  const status = yield* settings.status;
  const current = yield* settings.current;
  const entries = (yield* (yield* Logger).recent).slice(-RECENT_LOG_LIMIT);
  return [
    "WEG Manager – Diagnose",
    `Plugin-Version: ${host.pluginVersion}`,
    `Obsidian-API: ${host.apiVersion}`,
    `Plattform: ${host.platform}`,
    `Einstellungen beschreibbar: ${status.writable ? "ja" : "nein"}${status.readOnlyReason ? ` (${status.readOnlyReason})` : ""}`,
    `Hinweise zu Einstellungen: ${status.issues.length > 0 ? status.issues.join(" ") : "keine"}`,
    `Protokollstufe: ${current.logLevel}`,
    `Letzte Protokolleinträge (${entries.length}):`,
    ...entries.map(formatEntry),
  ].join("\n");
});
