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
    "weekStart.unknown": () => "Der Wochenbeginn muss ein Wochentag von Montag bis Sonntag sein.",
    "weekMinutes.invalid": ({ min, max }) =>
      `Das Zeitziel muss eine ganze Zahl von ${min} bis ${max} Minuten sein.`,
    "weekDecisions.invalid": ({ min, max }) =>
      `Die Anzahl regulärer Entscheidungen muss eine ganze Zahl von ${min} bis ${max} sein.`,
    "acuteDays.invalid": ({ min, max }) =>
      `Die Frist für akute Probleme muss eine ganze Zahl von ${min} bis ${max} Tagen sein.`,
    "rootFolder.invalid": ({ max }) =>
      `Der Wurzelordner muss ein Ordnerpfad im Vault mit höchstens ${max} Zeichen sein, mit „/“ zwischen den Ordnernamen, ohne Ordnernamen, die mit „.“ beginnen (solche Ordner blendet Obsidian aus), und ohne die Zeichen * " \\ < > : | ?.`,
  },
  errors: {
    storage: {
      title: "Einstellungen nicht gespeichert",
      detail:
        "Die Einstellungsdatei konnte nicht geschrieben werden. Deine Eingabe ist erhalten. Speichere erneut.",
      detailAfterClose:
        "Die Einstellungsdatei konnte nicht geschrieben werden, und deine Eingabe ging mit dem Schließen der Ansicht verloren. Öffne die Ansicht erneut und gib die Änderung noch einmal ein.",
    },
    readOnly: {
      title: "Einstellungen schreibgeschützt",
      detail: {
        "newer-version": `Die Einstellungen stammen aus einer neueren Version von ${PRODUCT_NAME}. Aktualisiere das Plugin, um sie zu ändern.`,
        unreadable:
          "Die Einstellungsdatei ist nicht lesbar. Es gelten Standardwerte, die Datei bleibt unverändert. Kopiere die Diagnose und melde es auf der GitHub-Seite des Plugins.",
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
      `Die Aktion wurde abgebrochen (Fehlercode ${incidentId}). Kopiere die Diagnose und melde den Fehler mit dem Fehlercode auf der GitHub-Seite des Plugins. Der Bericht enthält keine Inhalte deiner Notizen.`,
  },
  settingsReset: {
    title: "Einstellungen teilweise zurückgesetzt",
    detail: (issues) => `${issues} Für diese Werte gelten Standardwerte. Prüfe die Einstellungen.`,
  },
  diagnosticsCopied: {
    title: "Diagnose kopiert",
    detail:
      "Hänge den Bericht an deine Meldung auf der GitHub-Seite des Plugins an. Er enthält keine Inhalte deiner Notizen.",
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
    weekStart: {
      name: "Wochenbeginn",
      desc: "Der Tag, an dem deine Wochenarbeit beginnt. Ab ihm zählt die Woche in der Ansicht Woche.",
      labels: {
        monday: "Montag",
        tuesday: "Dienstag",
        wednesday: "Mittwoch",
        thursday: "Donnerstag",
        friday: "Freitag",
        saturday: "Samstag",
        sunday: "Sonntag",
      },
    },
    weekMinutes: {
      name: "Zeitziel der Woche",
      desc: "Wie lange die Wochenarbeit dauern soll, Vor- und Nachbereitung eingeschlossen.",
      minutes: (n) => `${n} Minuten`,
    },
    weekDecisions: {
      name: "Reguläre Entscheidungen pro Woche",
      desc: "Wie viele Entscheidungen die Woche höchstens vorlegt. Dringendes kommt zusätzlich und bleibt sichtbar.",
    },
    acuteDays: {
      name: "Frist für akute Probleme",
      desc: "Ab wie vielen Tagen vor einem Termin ein Vorgang als akut gilt und über die reguläre Auswahl hinaus erscheint.",
      days: (n) => (n === 0 ? "am Tag selbst" : n === 1 ? "1 Tag vorher" : `${n} Tage vorher`),
    },
  },
  frame: {
    navigation: "Ansichten",
    settings: "Einstellungen",
    content: "Inhalt",
    back: "Zurück",
    forward: "Vorwärts",
    settingsSections: "Bereiche der Einstellungen",
  },
  notFound: {
    title: "Nicht gefunden",
    detail:
      "Was du öffnen wolltest, gibt es nicht mehr. Vielleicht wurde es gelöscht oder umbenannt.",
    back: "Zur Startseite",
  },
};
