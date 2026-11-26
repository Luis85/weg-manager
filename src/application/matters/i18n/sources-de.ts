import { sourceLineIssues, type SourcesCatalog } from "./sources-catalog";

const oneLine = (label: string, max: number) =>
  `Gib für „${label}“ eine Zeile mit höchstens ${max} Zeichen ein.`;

/** German, du-form: first the cause, then the action (handoff HO-06). */
export const sourcesDe: SourcesCatalog = {
  kinds: {
    mail: "Mail",
    letter: "Brief",
    portal: "Portalnachricht",
    conversation: "Gespräch",
    meeting: "Versammlung",
    document: "Dokument",
    other: "Sonstiges",
  },
  fields: {
    subject: "Betreff",
    kind: "Art",
    community_id: "Gemeinschaft",
    matter_ids: "Vorgänge",
    received_on: "Eingegangen am",
    origin: "Herkunft",
    message_ref: "Nachrichtenkennung",
    link: "Quellenlink",
    files: "Originale",
  },
  missing: {
    subject: "Gib einen Betreff ein.",
    kind: "Wähle eine Art.",
    community_id: "Wähle eine Gemeinschaft.",
    origin: "Gib an, woher die Quelle kommt, etwa „Mail der Verwaltung“.",
  },
  issues: {
    ...sourceLineIssues(oneLine),
    "kind.unknown": () => "Diese Art kennt das Plugin nicht. Wähle eine aus der Liste.",
    "matter.other-community": () =>
      "Ein Vorgang gehört zu einer anderen Gemeinschaft. Ordne nur Vorgänge dieser Gemeinschaft zu.",
  },
  title: "Quellen",
  none: "Noch keine Quelle zu diesem Vorgang.",
  add: "Quelle erfassen",
  form: {
    title: "Quelle erfassen",
    text: "Nachrichtentext oder Gesprächsnotiz",
    textHint: "Füge den Text ein oder schreibe auf, was gesagt wurde.",
    originHint: "Wer hat es wem geschickt oder gesagt, etwa „Mail der Verwaltung an den Beirat“.",
    linkHint: "Eine Webadresse oder ein Pfad im Vault.",
    pick: "Originaldateien",
    pickHint: "Du kannst mehrere Dateien wählen, auch von außerhalb des Vaults.",
    copy: "In den Quellenordner kopieren",
    move: "In den Quellenordner verschieben",
    moveHint: "Das Original außerhalb wird entfernt, sobald die Kopie im Vault liegt.",
    moveUnavailable: "Verschieben geht nur am Desktop; die Dateien werden kopiert.",
    targets: "Die Dateien werden so abgelegt:",
    save: "Erfassen",
    cancel: "Abbrechen",
  },
  openFile: "In Obsidian öffnen",
  openFileLabel: (name) => `${name} in Obsidian öffnen`,
  missingFile: "Datei fehlt",
  noText: "Kein Text erfasst.",
  received: (day) => `eingegangen ${day}`,
  error: {
    title: "Quelle nicht erfasst",
    detail:
      "Einige Angaben fehlen oder passen nicht. Korrigiere die markierten Felder und erfasse erneut.",
  },
};
