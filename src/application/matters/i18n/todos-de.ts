import type { TodosCatalog } from "./todos-catalog";

const oneLine = (label: string) => `Gib für „${label}“ eine Zeile mit höchstens 300 Zeichen ein.`;

/** German, du-form: first the cause, then the action (handoff HO-06). */
export const todosDe: TodosCatalog = {
  segments: { matters: "Vorgänge", todos: "To-dos", label: "Vorgänge oder To-dos" },
  intro: (folder) =>
    `Jedes To-do ist eine Notiz im Ordner „${folder}“. Es erfüllt keine fremde Zusage.`,
  empty: "Hier erscheinen deine eigenen Schritte: was du erledigst, getrennt von fremden Zusagen.",
  loading: "To-dos werden geladen …",
  quick: {
    label: "Neues To-do",
    placeholder: "Was ist zu tun?",
    add: "Hinzufügen",
  },
  groups: {
    overdue: "Überfällig",
    week: "Diese Woche",
    later: "Später",
    closed: "Erledigt und entfallen",
  },
  statuses: { open: "offen", waiting: "wartet", done: "erledigt", dropped: "entfallen" },
  fields: {
    title: "Was ist zu tun",
    community_id: "Gemeinschaft",
    matter_id: "Vorgang",
    responsible: "Wer",
    status: "Zustand",
    due_on: "Fällig am",
    follow_up_on: "Wiedervorlage",
    reason: "Grund",
  },
  missing: {
    title: "Beschreibe den Schritt in einer Zeile.",
    community_id: "Wähle eine Gemeinschaft.",
    responsible: "Wähle, wer den Schritt erledigt.",
    status: "Wähle einen Zustand.",
  },
  issues: {
    "title.invalid": (_, label) => oneLine(label),
    "reason.invalid": (_, label) => oneLine(label),
    "responsible.invalid": () => "Wähle den Beirat oder einen Kontakt aus der Liste.",
    "status.unknown": () => "Diesen Zustand kennt das Plugin nicht. Wähle einen aus der Liste.",
    "reason.missing": () => "Gib den Grund an: worauf du wartest oder warum der Schritt entfällt.",
    "follow-up.missing": () => "Gib an, wann du wieder nachsiehst.",
    "matter.other-community": () =>
      "Der Vorgang gehört zu einer anderen Gemeinschaft. Wähle einen Vorgang dieser Gemeinschaft.",
  },
  board: "Beirat",
  noMatter: "ohne Vorgang",
  edit: "Bearbeiten",
  editLabel: (title) => `${title} bearbeiten`,
  done: "Erledigt",
  doneLabel: (title) => `${title} als erledigt markieren`,
  due: (day) => `fällig ${day}`,
  followUp: (day) => `Wiedervorlage ${day}`,
  responsible: (name) => `Wer: ${name}`,
  reason: (text) => `Grund: ${text}`,
  form: {
    createTitle: "To-do anlegen",
    editTitle: "To-do bearbeiten",
    save: "Speichern",
    cancel: "Abbrechen",
    choose: "Bitte wählen",
    statusHint: "Warten braucht Grund und Wiedervorlage, Entfallen einen Grund.",
  },
  clarification: {
    title: "Zu klären",
    hint: "Offene Vorgänge, für die kein offenes oder wartendes To-do den nächsten Schritt trägt.",
    none: "Jeder offene Vorgang hat ein To-do.",
    add: "To-do anlegen",
    addLabel: (matter) => `To-do für ${matter} anlegen`,
  },
  ofMatter: { title: "To-dos", none: "Noch kein To-do zu diesem Vorgang." },
  error: {
    title: "To-do nicht gespeichert",
    detail:
      "Einige Angaben fehlen oder passen nicht. Korrigiere die markierten Felder und speichere erneut.",
  },
};
