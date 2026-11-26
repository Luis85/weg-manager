import type { WeekCatalog } from "./catalog";

/** „1 Vorgang ist“ / „3 Vorgänge sind“: the count with its noun and verb. */
const matters = (count: number, one: string, many: string) =>
  count === 1 ? `1 Vorgang ${one}` : `${count} Vorgänge ${many}`;

/** German, du-form: first the cause, then the action (handoff HO-06). */
export const weekDe: WeekCatalog = {
  route: "Woche",
  screen: {
    title: (weekOf) => `Woche ab ${weekOf}`,
    intro:
      "Die Lage dieser Woche aus deinen Vorgängen, To-dos und Quellen. Sie wird beim Öffnen berechnet.",
    computed: (day, time) => `Stand: ${day}, ${time} Uhr, beim Öffnen berechnet`,
    timeTarget: (minutes) => `Zeitziel: ${minutes} Minuten`,
    loading: "Woche wird geladen …",
  },
  briefing: {
    title: "Lage",
    computedTitle: "Berechnet",
    savedTitle: "Deine Lage",
    edit: "Bearbeiten",
    editTitle: "Lage bearbeiten",
    hint: "Ergänze oder kürze den Text. Gespeichert wird er in der Wochennotiz.",
    save: "Speichern",
    cancel: "Abbrechen",
    sentences: {
      overdue: (count, refs) => `${matters(count, "ist überfällig", "sind überfällig")}: ${refs}.`,
      acute: (count, refs) => `${matters(count, "ist akut fällig", "sind akut fällig")}: ${refs}.`,
      "due-soon": (count, refs) =>
        `${matters(count, "wird in den nächsten 14 Tagen fällig", "werden in den nächsten 14 Tagen fällig")}: ${refs}.`,
      "ask-date": (count, refs) =>
        `${matters(count, "hat keinen Termin", "haben keinen Termin")}; frag ihn nach: ${refs}.`,
      "todos-open": (count, refs) =>
        count === 1
          ? `1 eigenes To-do ist offen: ${refs}.`
          : `${count} eigene To-dos sind offen: ${refs}.`,
      clarify: (count, refs) =>
        `${matters(count, "hat kein To-do für den nächsten Schritt", "haben kein To-do für den nächsten Schritt")}: ${refs}.`,
      "sources-new": (count, refs) =>
        count === 1
          ? `1 Quelle kam diese Woche dazu: ${refs}.`
          : `${count} Quellen kamen diese Woche dazu: ${refs}.`,
      "source-gaps": (count, refs) =>
        `${matters(count, "hat keine bekannte Quelle", "haben keine bekannte Quelle")}: ${refs}.`,
      quiet: () => "Diese Woche ist nichts fällig und nichts offen.",
    },
  },
  deadlines: {
    title: "Fristen der nächsten 14 Tage",
    none: "In den nächsten 14 Tagen ist nichts fällig.",
    states: { overdue: "überfällig", acute: "akut", soon: "bald" },
  },
  todos: { title: "Eigene To-dos", none: "Kein To-do ist offen." },
  coverage: {
    title: "Grundlage",
    sources: (count, thisWeek) => `${count} Quellen berücksichtigt, ${thisWeek} davon diese Woche`,
    unchecked: (count) => `${count} ungeprüft (keinem Vorgang zugeordnet)`,
    withoutSource: (count) => `${count} Vorgänge ohne Quelle`,
    withoutDate: (count) => `${count} Vorgänge ohne Termin`,
    noGaps: "keine bekannten Lücken",
    scope:
      "Grundlage sind die erfassten Quellen. Das Plugin liest kein Postfach und kennt nicht jeden Eingang.",
  },
  decisions: {
    title: "Entscheidungen",
    budget: (selected, budget) => `${selected}/${budget} reguläre Entscheidungen`,
    hint: "Über alle Gemeinschaften zusammen, ausgewählt nach Frist und Alter der Zusage.",
    none: "Keine reguläre Entscheidung steht an.",
    urgentTitle: "Dringend · zusätzlich",
    urgentHint:
      "Überfällig oder bis Wochenende beziehungsweise zur Frist für akute Probleme fällig. Zählt nicht ins Budget.",
    backlogTitle: (count) => `Rückstand (${count})`,
    reasons: {
      overdue: (day) => `überfällig seit ${day}`,
      "due-this-week": (day) => `fällig ${day}`,
      due: (day) => `nächster Termin ${day}`,
      age: (days) => `Zusage vor ${days} Tagen`,
      "age-unknown": () => "ohne Termin, Alter der Zusage unbekannt",
    },
    nextStep: (step) => `Nächster Schritt: ${step}`,
    focusPending:
      "Die Schwerpunkte der letzten Woche zählen für die Auswahl, sobald es die Übergabe gibt.",
  },
  errors: {
    changed: {
      title: "Lage nicht gespeichert",
      detail:
        "Die Wochennotiz wurde inzwischen außerhalb des Plugins geändert. Öffne die Lage erneut und bearbeite den aktuellen Text.",
    },
  },
};
