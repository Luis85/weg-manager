import type { MattersCatalog } from "./catalog";
import { lineIssues } from "./line-issues";

const oneLine = (label: string, max: number) =>
  `Gib für „${label}“ eine Zeile mit höchstens ${max} Zeichen ein.`;

/** German, du-form: first the cause, then the action (handoff HO-06). */
export const mattersDe: MattersCatalog = {
  route: "Vorgänge",
  screen: {
    title: "Vorgänge",
    intro: (folder) => `Jeder Vorgang ist eine Notiz im Ordner „${folder}“.`,
    add: "Vorgang erfassen",
    loading: "Vorgänge werden geladen …",
    empty:
      "Hier erscheinen deine Vorgänge: jede Zusage, Frist, Frage oder Aufgabe mit einem Ergebnis.",
    edit: "Bearbeiten",
    editLabel: (name) => `${name} bearbeiten`,
    readOnly: "Schreibgeschützt",
    search: "Suchen",
    allTopics: "Alle Themen",
    allStatuses: "Alle Stände",
    allCommunities: "Alle Gemeinschaften",
    allResponsible: "Alle Verantwortlichen",
    shown: (count, total) => `${count} von ${total} Vorgängen`,
    noMatch: "Kein Vorgang passt zu Suche und Filtern.",
    due: (day) => `bis ${day}`,
    noDue: "ohne Termin",
    followUp: (day) => `Wiedervorlage ${day}`,
    responsible: (name) => `Wer: ${name}`,
    nextStep: (step) => `Nächster Schritt: ${step}`,
    sourceGap: "Quelle unbekannt",
  },
  fields: {
    number: "Nummer",
    community_id: "Gemeinschaft",
    kind: "Art",
    topic: "Thema",
    outcome: "Erwartetes Ergebnis",
    responsible_id: "Wer",
    promised_on: "Zugesagt am",
    due_on: "Bis wann",
    follow_up_on: "Wiedervorlage",
    status: "Bearbeitungsstand",
    done_on: "Erledigt am",
    source: "Quelle",
    next_step: "Nächster Schritt",
    message_ref: "Nachrichtenreferenz",
    link: "Link",
  },
  kinds: {
    manager_promise: "Zusage Verwaltung",
    third_party_promise: "Zusage Dritter",
    board_deadline: "Frist Beirat",
    legal_deadline: "Frist gesetzlich",
    question: "Frage",
    board_task: "Aufgabe Beirat",
  },
  statuses: { open: "offen", unclear: "ungeklärt", done: "erledigt", obsolete: "hinfällig" },
  checkMarks: { overdue: "überfällig", ask_for_date: "Termin erfragen" },
  form: {
    createTitle: "Neuer Vorgang",
    editTitle: "Vorgang bearbeiten",
    save: "Speichern",
    cancel: "Abbrechen",
    choose: "Bitte wählen",
    numberHint: "Die Nummer wird beim Speichern vergeben.",
    sourceHint: "Etwa Mail, Protokoll, Versammlung oder Gespräch.",
    sourceUnknown: "Quelle unbekannt",
    followUpHint: "Dein eigenes Datum zum erneuten Ansehen. Es ändert keinen Termin.",
    noContacts: "Lege zuerst unter „Kontakte“ einen Kontakt an.",
    noCommunities: "Lege zuerst unter „Einstellungen“ eine Gemeinschaft an.",
  },
  missing: {
    community_id: "Wähle eine Gemeinschaft.",
    kind: "Wähle eine Art.",
    topic: "Gib ein Thema ein.",
    outcome: "Gib das erwartete Ergebnis in einem Satz ein.",
    responsible_id: "Wähle, wer verantwortlich ist.",
    status: "Wähle einen Bearbeitungsstand.",
    source: "Gib eine Quelle an oder wähle „Quelle unbekannt“.",
    next_step: "Gib den nächsten Schritt ein.",
  },
  issues: {
    ...lineIssues(oneLine),
    "number.invalid": () => "Die Nummer muss eine ganze Zahl ab 1 sein.",
    "number.taken": () => "Diese Nummer hat schon ein anderer Vorgang. Wähle eine andere.",
    "number.duplicate": () =>
      "Ein anderer Vorgang hat dieselbe Nummer, etwa nach einem Sync. Gib einem der beiden eine neue Nummer.",
    "kind.unknown": () => "Diese Art kennt das Plugin nicht. Wähle eine aus der Liste.",
    "status.unknown": () =>
      "Diesen Bearbeitungsstand kennt das Plugin nicht. Wähle einen aus der Liste.",
    "outcome.too-long": (_, label) =>
      `„${label}“ ergibt einen zu langen Dateinamen, weil manche Zeichen mehr Platz brauchen. Kürze den Text.`,
    "done-on.missing": () => "Ein erledigter Vorgang braucht das Datum, an dem er erledigt wurde.",
    "done-on.not-done": () =>
      "Ein Erledigt-Datum gibt es nur bei „erledigt“. Leere das Datum oder setze den Stand auf erledigt.",
  },
  errors: {
    invalid: {
      title: "Vorgang nicht gespeichert",
      detail:
        "Einige Angaben fehlen oder passen nicht. Korrigiere die markierten Felder und speichere erneut.",
    },
  },
};
