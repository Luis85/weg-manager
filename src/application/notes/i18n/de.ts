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
  },
};
