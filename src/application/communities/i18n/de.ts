import { LABEL_MAX_LENGTH, NAME_MAX_LENGTH } from "../../../domain/communities";
import type { CommunitiesCatalog } from "./catalog";

const oneLine = (label: string, max: number) =>
  `Gib für „${label}“ eine Zeile mit höchstens ${max} Zeichen ein.`;

/** German, du-form: first the cause, then the action (handoff HO-06). */
export const communitiesDe: CommunitiesCatalog = {
  route: "Gemeinschaften",
  screen: {
    title: "Gemeinschaften",
    intro: (folder) => `Jede Gemeinschaft ist eine Notiz im Ordner „${folder}“.`,
    add: "Gemeinschaft anlegen",
    loading: "Gemeinschaften werden geladen …",
    empty: "Hier erscheinen deine Gemeinschaften, etwa eine WEG und ihre Tiefgarage.",
    edit: "Bearbeiten",
    remove: "Löschen",
    editLabel: (name) => `${name} bearbeiten`,
    removeLabel: (name) => `${name} löschen`,
    readOnly: "Schreibgeschützt",
    selected: "Aktuell",
    summary: (kind, unitLabel) => `${kind} (${unitLabel})`,
    otherNotes: "Andere Notizen von WEG Manager",
    openNote: "In Obsidian öffnen",
    openNoteLabel: (name) => `${name} in Obsidian öffnen`,
  },
  fields: {
    name: "Name",
    short_code: "Kürzel",
    color: "Farbe",
    kind: "Art",
    unit_label: "Einheitenbezeichnung",
  },
  noShortCode: "?",
  shortCodeHint:
    "2 bis 5 Buchstaben oder Ziffern, z. B. AW. Lässt sich nach dem Anlegen nicht mehr ändern.",
  shortCodeFixed: "Das Kürzel lässt sich nach dem Anlegen nicht mehr ändern.",
  unitLabelHelp: "Wie die Einheiten heißen, z. B. Einheiten oder Stellplätze.",
  colors: {
    teal: "Petrol",
    violet: "Violett",
    blue: "Blau",
    rust: "Rostrot",
    slate: "Schiefergrau",
    cyan: "Cyan",
    pink: "Pink",
    olive: "Oliv",
  },
  colorTaken: (color) => `${color}, schon vergeben`,
  preview: "Vorschau",
  builtInKinds: [
    { kind: "WEG", unit_label: "Einheiten" },
    { kind: "Tiefgarage", unit_label: "Stellplätze" },
  ],
  suggestions: "Vorschläge:",
  suggestion: ({ kind, unit_label }) => `${kind} · ${unit_label}`,
  form: {
    createTitle: "Neue Gemeinschaft",
    editTitle: "Gemeinschaft bearbeiten",
    save: "Speichern",
    cancel: "Abbrechen",
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
    title: "Gemeinschaft löschen",
    detail: (name) =>
      `„${name}“ wird in Obsidians Papierkorb verschoben. Dort kannst du die Notiz wiederherstellen.`,
    confirm: "In den Papierkorb verschieben",
    cancel: "Abbrechen",
  },
  switcher: {
    label: "Gemeinschaft",
    loading: "Wird geladen …",
    choose: "Wähle die Gemeinschaft, in der du arbeitest.",
    none: "Noch keine Gemeinschaft",
    unavailable:
      "Keine Gemeinschaft ist wählbar, solange ihre Angaben nicht stimmen. Korrigiere sie unter „Gemeinschaften“.",
  },
  missing: {
    name: "Gib einen Namen ein.",
    short_code: "Gib ein Kürzel ein.",
    color: "Wähle eine Farbe.",
    kind: "Gib eine Art ein oder wähle einen Vorschlag.",
    unit_label: "Gib an, wie die Einheiten heißen.",
  },
  issues: {
    "name.invalid": (_, label) => oneLine(label, NAME_MAX_LENGTH),
    "short-code.invalid": () => "Das Kürzel braucht 2 bis 5 Buchstaben (A–Z) oder Ziffern.",
    "short-code.taken": ({ value, other }) =>
      `„${other}“ hat schon das Kürzel ${value}. Wähle ein anderes.`,
    "short-code.duplicate": ({ value, other }) =>
      `„${other}“ hat dasselbe Kürzel ${value}. Gib einer der beiden ein anderes Kürzel.`,
    "color.unknown": ({ value }) =>
      `Die gespeicherte Farbe „${value}“ gibt es nicht. Wähle eine Farbe.`,
    "color.taken": () => "Eine andere Gemeinschaft hat diese Farbe schon. Wähle eine andere.",
    "kind.invalid": (_, label) => oneLine(label, LABEL_MAX_LENGTH),
    "unit-label.invalid": (_, label) => oneLine(label, LABEL_MAX_LENGTH),
  },
  notices: {
    created: (name) => `„${name}“ angelegt`,
    saved: (name) => `„${name}“ gespeichert`,
    deleted: (name) => `„${name}“ in den Papierkorb verschoben`,
  },
  errors: {
    invalid: {
      title: "Gemeinschaft nicht gespeichert",
      detail:
        "Einige Angaben fehlen oder passen nicht. Korrigiere die markierten Felder und speichere erneut.",
    },
  },
};
