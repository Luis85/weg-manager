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
        "Die Eigenschaften oben in der Notiz sind fehlerhaft geschrieben, deshalb kann WEG Manager sie nicht ändern. Öffne die Notiz, korrigiere die Eigenschaften und speichere dann erneut.",
    },
    write: {
      title: "Notiz nicht gespeichert",
      detail: "Obsidian konnte die Notiz nicht schreiben. Versuche es erneut.",
    },
    trash: {
      title: "Notiz nicht gelöscht",
      detail: "Obsidian konnte die Notiz nicht in den Papierkorb verschieben. Versuche es erneut.",
    },
    editConflict: {
      title: "Notiz geändert, während du bearbeitet hast",
      detail:
        "Die Notiz wurde auch außerhalb dieses Formulars geändert, in Angaben, die du bearbeitet hast. Wähle je Angabe den Wert, der gelten soll, und speichere erneut.",
    },
    writeRefused: {
      title: "Speichern nicht möglich",
      detail: {
        "other-type":
          "Die Notiz ist inzwischen kein Datensatz dieses Typs mehr. Prüfe ihre Eigenschaft „schema“ in Obsidian.",
        "newer-version":
          "Die Notiz wurde inzwischen mit einer neueren Version von WEG Manager gespeichert, etwa auf einem anderen Gerät. Aktualisiere WEG Manager und öffne sie dann erneut.",
        identity:
          "Die Kennung („id“) der Notiz wurde geändert, sie gehört jetzt zu einem anderen Datensatz. Schließe das Formular und öffne es erneut.",
        "duplicate-id":
          "Eine andere Notiz hat dieselbe Kennung („id“), deshalb ist unklar, welche gemeint ist. Lösche die doppelte Notiz in Obsidian und versuche es dann erneut.",
        "migration-failed":
          "Die Notiz ließ sich nicht auf die aktuelle Version umstellen. Öffne die Notiz und prüfe ihre Eigenschaften.",
        layout:
          "Die Eigenschaften der Notiz sind so geschrieben, dass WEG Manager sie nicht ändern kann, ohne auch andere Zeilen zu ändern. Schreibe in Obsidian jede Eigenschaft als eigene Zeile „schlüssel: wert“ zwischen zwei Zeilen „---“ und speichere dann erneut.",
      },
    },
    indexRead: {
      title: "Notizen nicht gelesen",
      detail:
        "Obsidian konnte nicht alle Notizen lesen, deshalb ist die Liste vielleicht unvollständig. Versuche es erneut.",
    },
  },
  openNote: {
    label: "In Obsidian öffnen",
    labelFor: (name) => `${name} in Obsidian öffnen`,
  },
  conflict: {
    title: "Notiz geändert, während du bearbeitet hast",
    detail:
      "Diese Angaben wurden auch außerhalb dieses Formulars geändert, etwa auf einem anderen Gerät. Wähle je Angabe den Wert, der gelten soll, und speichere.",
    loaded: (value) => `Beim Öffnen: ${value}`,
    mine: (value) => `Deine Eingabe: ${value}`,
    theirs: (value) => `Jetzt in der Notiz: ${value}`,
    apply: "Auswahl speichern",
    empty: "(leer)",
  },
  deletion: {
    detail: (name) =>
      `„${name}“ wird in Obsidians Papierkorb verschoben. Dort kannst du die Notiz wiederherstellen.`,
    confirm: "In den Papierkorb verschieben",
    cancel: "Abbrechen",
  },
  dataIssues: {
    otherNotes: "Andere Notizen von WEG Manager",
  },
  notices: {
    created: (name) => `„${name}“ angelegt`,
    saved: (name) => `„${name}“ gespeichert`,
    deleted: (name) => `„${name}“ in den Papierkorb verschoben`,
  },
  recordIssues: {
    "schema.malformed": () =>
      "Die Eigenschaft „schema“ ist falsch geschrieben, deshalb ist die Notiz schreibgeschützt. Öffne die Notiz und korrigiere „schema“.",
    "schema.newer": () =>
      "Die Notiz wurde mit einer neueren Version von WEG Manager gespeichert, etwa auf einem anderen Gerät, deshalb ist sie hier schreibgeschützt. Aktualisiere WEG Manager, um sie zu bearbeiten.",
    "migration.failed": () =>
      "Die Notiz ließ sich nicht auf die aktuelle Version umstellen, deshalb ist sie schreibgeschützt. Öffne die Notiz und prüfe ihre Eigenschaften.",
    "id.missing": () =>
      "Die Notiz hat keine Eigenschaft „id“, deshalb ist sie schreibgeschützt. Stelle die „id“ in Obsidian wieder her, etwa aus einer Sicherung.",
    "id.malformed": () =>
      "Die Eigenschaft „id“ der Notiz ist ungültig, deshalb ist sie schreibgeschützt. Stelle die ursprüngliche „id“ in Obsidian wieder her.",
    "id.other-type": () =>
      "Die „id“ der Notiz gehört zu einem anderen Typ, deshalb ist sie schreibgeschützt. Prüfe „schema“ und „id“ in Obsidian.",
    "id.duplicate": ({ other }) =>
      `Die Notiz „${other}“ hat dieselbe „id“, deshalb sind beide schreibgeschützt. Lösche die doppelte Notiz in Obsidian.`,
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
  unindexedIssues: {
    "schema.malformed": () =>
      "Die Eigenschaft „schema“ ist falsch geschrieben, deshalb kann WEG Manager die Notiz keinem Typ zuordnen. Öffne die Notiz und korrigiere „schema“.",
    "schema.unknown-type": ({ type }) =>
      `Die Notiz ist als Typ „${type}“ markiert, den diese Version von WEG Manager nicht kennt. Aktualisiere WEG Manager oder korrigiere „schema“ in Obsidian.`,
    "frontmatter.unreadable": () =>
      "Die Eigenschaften oben in der Notiz sind fehlerhaft geschrieben, deshalb kann WEG Manager sie nicht lesen. Öffne die Notiz und korrigiere die Eigenschaften.",
  },
};
