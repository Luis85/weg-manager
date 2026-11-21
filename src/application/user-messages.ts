import type { AppError } from "./errors";

export type UserMessageAction = "retry" | "open-settings" | "copy-diagnostics";

/**
 * What the user sees for any outcome. German, du-form, cause then action (handoff HO-06).
 * Never a stack trace, path, raw error message or note content.
 */
export type UserMessage = {
  readonly severity: "info" | "warning" | "error";
  readonly title: string;
  readonly detail: string;
  readonly action?: UserMessageAction;
};

const PLUGIN_NAME = "WEG Manager";

const readOnlyDetail = {
  "newer-version": `Die Einstellungen stammen aus einer neueren Version von ${PLUGIN_NAME}. Aktualisiere das Plugin, um sie zu ändern.`,
  unreadable:
    "Die Einstellungsdatei ist nicht lesbar. Es gelten Standardwerte, die Datei bleibt unverändert. Kopiere die Diagnose für den Support.",
} as const;

export const describeError = (error: AppError): UserMessage => {
  switch (error._tag) {
    case "StorageError":
      return {
        severity: "error",
        title: "Einstellungen nicht gespeichert",
        detail:
          "Die Einstellungsdatei konnte nicht geschrieben werden. Deine Eingabe ist erhalten. Speichere erneut.",
        action: "retry",
      };
    case "ReadOnlySettingsError":
      return {
        severity: "warning",
        title: "Einstellungen schreibgeschützt",
        detail: readOnlyDetail[error.reason],
        action: "copy-diagnostics",
      };
    case "InvalidSettingsError":
      return { severity: "warning", title: "Eingabe ungültig", detail: error.issues.join(" ") };
    case "VaultReadError":
      return {
        severity: "error",
        title: "Notizen nicht lesbar",
        detail: "Die Dateien im Vault konnten nicht gelesen werden. Versuche es erneut.",
        action: "retry",
      };
    case "ClipboardError":
      return {
        severity: "error",
        title: "Diagnose nicht kopiert",
        detail: "Die Zwischenablage ist nicht verfügbar. Versuche es erneut.",
        action: "retry",
      };
  }
};

export const describeDefect = (incidentId: string): UserMessage => ({
  severity: "error",
  title: `Unerwarteter Fehler in ${PLUGIN_NAME}`,
  detail: `Die Aktion wurde abgebrochen (Fehlercode ${incidentId}). Kopiere die Diagnose und schicke sie mit dem Fehlercode an den Support.`,
  action: "copy-diagnostics",
});

export const describeSettingsIssues = (issues: readonly string[]): UserMessage => ({
  severity: "warning",
  title: "Einstellungen teilweise zurückgesetzt",
  detail: `${issues.join(" ")} Für diese Werte gelten Standardwerte. Prüfe die Einstellungen.`,
  action: "open-settings",
});
