import type { NotesCatalog } from "./catalog";

/** German, du-form: first the cause, then the action (handoff HO-06). */
export const notesDe: NotesCatalog = {
  errors: {
    notFound: {
      title: "Notiz nicht gefunden",
      detail: "Die Notiz wurde verschoben oder gelöscht. Prüfe, ob sie noch im Vault liegt.",
    },
    pathTaken: {
      title: "Name schon vergeben",
      detail: "Im Ordner gibt es schon eine Notiz mit diesem Namen. Wähle einen anderen Namen.",
    },
    invalidName: {
      title: "Name nicht möglich",
      detail: {
        empty: "Der Name ist leer. Gib einen Namen ein.",
        "forbidden-character":
          "Der Name enthält ein Zeichen, das in Dateinamen nicht vorkommen darf, etwa einen Schrägstrich oder Doppelpunkt. Entferne es.",
        "leading-dot":
          "Der Name beginnt mit einem Punkt, dann blendet Obsidian die Notiz aus. Entferne den Punkt.",
      },
    },
    unreadable: {
      title: "Eigenschaften nicht lesbar",
      detail:
        "Die Eigenschaften der Notiz sind kein gültiges YAML. Korrigiere sie in Obsidian und versuche es dann erneut.",
    },
    write: {
      title: "Notiz nicht gespeichert",
      detail: "Obsidian konnte die Notiz nicht schreiben. Versuche es erneut.",
    },
    editConflict: {
      title: "Notiz inzwischen geändert",
      detail:
        "Die Notiz wurde außerhalb des Formulars geändert, auch in Feldern, die du bearbeitet hast. Wähle für jedes dieser Felder den Wert, der gelten soll, und speichere erneut.",
    },
    writeRefused: {
      title: "Speichern nicht möglich",
      detail: {
        "other-type":
          "Die Notiz ist inzwischen kein Datensatz dieses Typs mehr. Prüfe ihre Eigenschaft „schema“ in Obsidian.",
        "newer-version":
          "Eine neuere Plugin-Version hat die Notiz inzwischen gespeichert. Aktualisiere WEG Manager und öffne sie dann erneut.",
        identity:
          "Die „id“ der Notiz hat sich inzwischen geändert, sie ist also nicht mehr derselbe Datensatz. Öffne die Notiz erneut.",
        "migration-failed":
          "Die Notiz ließ sich nicht auf die aktuelle Schemaversion umstellen. Prüfe ihre Eigenschaften in Obsidian.",
      },
    },
  },
  recordIssues: {
    "schema.malformed": () =>
      "Die Eigenschaft „schema“ ist nicht lesbar, deshalb ist die Notiz schreibgeschützt. Korrigiere sie in Obsidian nach dem Dateivertrag.",
    "schema.newer": ({ version }) =>
      `Die Notiz stammt aus einer neueren Plugin-Version (Schemaversion ${version}), deshalb ist sie schreibgeschützt. Aktualisiere WEG Manager, um sie zu bearbeiten.`,
    "migration.failed": ({ from }) =>
      `Die Notiz ließ sich nicht von Schemaversion ${from} auf die aktuelle Version umstellen, deshalb ist sie schreibgeschützt. Prüfe ihre Eigenschaften in Obsidian.`,
    "id.missing": () =>
      "Die Notiz hat keine Eigenschaft „id“, deshalb ist sie schreibgeschützt. Stelle die „id“ in Obsidian wieder her, etwa aus einer Sicherung.",
    "id.malformed": () =>
      "Die Eigenschaft „id“ der Notiz ist ungültig, deshalb ist sie schreibgeschützt. Stelle die ursprüngliche „id“ in Obsidian wieder her.",
    "id.other-type": () =>
      "Die „id“ der Notiz gehört zu einem anderen Typ, deshalb ist sie schreibgeschützt. Prüfe „schema“ und „id“ in Obsidian.",
    "id.duplicate": () =>
      "Eine andere Notiz hat dieselbe „id“, deshalb sind beide schreibgeschützt. Lösche die doppelte Notiz in Obsidian.",
  },
  fieldIssues: {
    "field.missing": (label) => `„${label}“ fehlt. Gib einen Wert ein.`,
    "field.text": (label) => `„${label}“ ist kein Text. Gib einen Text ein.`,
    "field.number": (label) => `„${label}“ ist keine Zahl. Gib eine Zahl ein.`,
    "field.checkbox": (label) =>
      `„${label}“ ist kein Ja-oder-Nein-Wert. Setze das Häkchen oder entferne es.`,
    "field.date": (label) =>
      `„${label}“ ist kein gültiges Datum. Gib ein Datum im Format JJJJ-MM-TT ein.`,
    "field.list": (label) => `„${label}“ ist keine Liste von Texten. Gib eine Liste ein.`,
  },
};
