import { LABEL_MAX_LENGTH, NAME_MAX_LENGTH } from "../../../domain/communities";
import type { CommunitiesCatalog } from "./catalog";

const oneLine = (label: string, max: number) =>
  `„${label}“ ist leer, länger als ${max} Zeichen oder mehrzeilig. Gib eine Zeile mit höchstens ${max} Zeichen ein.`;

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
    summary: (kind, unitLabel) => `${kind} · ${unitLabel}`,
    problems: "Notizen mit Problemen",
  },
  fields: {
    name: "Name",
    short_code: "Kürzel",
    color: "Farbe",
    kind: "Art",
    unit_label: "Einheitenbezeichnung",
  },
  noShortCode: "?",
  shortCodeHint: "2 bis 5 Zeichen aus A–Z und 0–9, nach dem Anlegen fest.",
  shortCodeFixed: "Das Kürzel ist nach dem Anlegen fest.",
  colors: {
    teal: "Petrol",
    violet: "Violett",
    blue: "Blau",
    rust: "Rost",
    slate: "Schiefer",
    cyan: "Cyan",
    pink: "Pink",
    olive: "Oliv",
  },
  colorTaken: (color) => `${color}, schon vergeben`,
  builtInKinds: [
    { kind: "WEG", unit_label: "Einheiten" },
    { kind: "Tiefgarage", unit_label: "Stellplätze" },
  ],
  suggestions: "Vorschläge",
  suggestion: ({ kind, unit_label }) => `${kind} · ${unit_label}`,
  form: {
    createTitle: "Neue Gemeinschaft",
    editTitle: "Gemeinschaft bearbeiten",
    save: "Speichern",
    cancel: "Abbrechen",
  },
  conflict: {
    title: "Notiz inzwischen geändert",
    detail:
      "Diese Felder wurden auch außerhalb des Formulars geändert. Wähle je Feld den Wert, der gelten soll, und speichere.",
    loaded: (value) => `Beim Öffnen: ${value}`,
    mine: (value) => `Deine Eingabe: ${value}`,
    theirs: (value) => `In der Notiz: ${value}`,
    apply: "Auswahl speichern",
    empty: "(leer)",
  },
  deletion: {
    title: "Gemeinschaft löschen",
    detail: (name) => `„${name}“ kommt in den Papierkorb, den du in Obsidian eingestellt hast.`,
    confirm: "Löschen",
    cancel: "Abbrechen",
  },
  switcher: {
    label: "Gemeinschaft",
    choose: "Wähle die Gemeinschaft, in der du arbeitest.",
    none: "Noch keine Gemeinschaft",
  },
  issues: {
    "name.invalid": (label) => oneLine(label, NAME_MAX_LENGTH),
    "short-code.invalid": (label) =>
      `„${label}“ hat nicht 2 bis 5 Zeichen aus A–Z und 0–9. Gib ein solches Kürzel ein.`,
    "short-code.taken": () =>
      "Eine andere Gemeinschaft hat dieses Kürzel schon. Wähle ein anderes.",
    "short-code.duplicate": () =>
      "Eine andere Gemeinschaft hat dasselbe Kürzel. Gib einer der beiden ein anderes.",
    "color.unknown": (label) => `„${label}“ ist keine Farbe der Palette. Wähle eine Farbe aus.`,
    "color.taken": () => "Eine andere Gemeinschaft hat diese Farbe schon. Wähle eine andere.",
    "kind.invalid": (label) => oneLine(label, LABEL_MAX_LENGTH),
    "unit-label.invalid": (label) => oneLine(label, LABEL_MAX_LENGTH),
  },
  errors: {
    invalid: {
      title: "Gemeinschaft nicht gespeichert",
      detail:
        "Einige Angaben erfüllen die Regeln nicht. Korrigiere die markierten Felder und speichere erneut.",
    },
  },
};
