import { PRODUCT_NAME, type ShellCatalog } from "./catalog";

/** German, du-form: first the cause, then the action (handoff HO-06). */
export const shellDe: ShellCatalog = {
  language: "de",
  issues: {
    "file.invalid": () => "Die Einstellungsdatei enthält keine gültigen Einstellungen.",
    "schema.newer": ({ version }) =>
      `Die Einstellungen stammen aus einer neueren Plugin-Version (Schemaversion ${version}).`,
    "schema.invalid": () => "Die Schemaversion muss eine positive ganze Zahl sein.",
    "migration.failed": ({ from }) =>
      `Die Einstellungen aus Schemaversion ${from} ließen sich nicht auf die aktuelle Version umstellen.`,
    "logLevel.unknown": ({ allowed }) =>
      `Die Protokollstufe muss eine von ${allowed.join(", ")} sein.`,
    "rootFolder.invalid": ({ max }) =>
      `Der Wurzelordner muss ein Ordnerpfad im Vault mit höchstens ${max} Zeichen sein, mit „/“ zwischen den Ordnernamen, ohne Ordnernamen, die mit „.“ beginnen (solche Ordner blendet Obsidian aus), und ohne die Zeichen * " \\ < > : | ?.`,
  },
  errors: {
    storage: {
      title: "Einstellungen nicht gespeichert",
      detail:
        "Die Einstellungsdatei konnte nicht geschrieben werden. Deine Eingabe ist erhalten. Speichere erneut.",
    },
    readOnly: {
      title: "Einstellungen schreibgeschützt",
      detail: {
        "newer-version": `Die Einstellungen stammen aus einer neueren Version von ${PRODUCT_NAME}. Aktualisiere das Plugin, um sie zu ändern.`,
        unreadable:
          "Die Einstellungsdatei ist nicht lesbar. Es gelten Standardwerte, die Datei bleibt unverändert. Kopiere die Diagnose für den Support.",
      },
    },
    invalidSettings: { title: "Eingabe ungültig" },
    vaultRead: {
      title: "Notizen nicht lesbar",
      detail: "Die Dateien im Vault konnten nicht gelesen werden. Versuche es erneut.",
    },
    clipboard: {
      title: "Diagnose nicht kopiert",
      detail: "Die Zwischenablage ist nicht verfügbar. Versuche es erneut.",
    },
  },
  defect: {
    title: `Unerwarteter Fehler in ${PRODUCT_NAME}`,
    detail: (incidentId) =>
      `Die Aktion wurde abgebrochen (Fehlercode ${incidentId}). Kopiere die Diagnose und schicke sie mit dem Fehlercode an den Support.`,
  },
  settingsReset: {
    title: "Einstellungen teilweise zurückgesetzt",
    detail: (issues) => `${issues} Für diese Werte gelten Standardwerte. Prüfe die Einstellungen.`,
  },
  diagnosticsCopied: {
    title: "Diagnose kopiert",
    detail: "Füge den Bericht in deine Support-Anfrage ein.",
  },
  actions: {
    retry: "Erneut versuchen",
    "open-settings": "Einstellungen öffnen",
    "copy-diagnostics": "Diagnose kopieren",
  },
  commands: {
    openView: "Ansicht öffnen",
    copyDiagnostics: "Diagnose kopieren",
  },
  settingsTab: {
    logLevel: {
      name: "Protokollstufe",
      desc: "Wie ausführlich das Plugin in die Entwicklerkonsole schreibt.",
      labels: { error: "Fehler", warn: "Warnungen", info: "Informationen", debug: "Details" },
    },
  },
  frame: { navigation: "Ansichten", content: "Inhalt", back: "Zurück", forward: "Vorwärts" },
  notFound: {
    title: "Nicht gefunden",
    detail:
      "Was du öffnen wolltest, gibt es nicht mehr. Vielleicht wurde es gelöscht oder umbenannt.",
    back: "Zur Startseite",
  },
};
