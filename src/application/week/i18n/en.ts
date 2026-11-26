import type { WeekCatalog } from "./catalog";

/** "1 matter is" / "3 matters are": the count with its noun and verb. */
const matters = (count: number, one: string, many: string) =>
  count === 1 ? `1 matter ${one}` : `${count} matters ${many}`;

/** English, sentence case: first the cause, then the action. */
export const weekEn: WeekCatalog = {
  route: "Week",
  screen: {
    title: (weekOf) => `Week from ${weekOf}`,
    intro:
      "This week's briefing from your matters, to-dos and sources. It is computed when you open it.",
    computed: (day, time) => `As of ${day}, ${time}, computed on opening`,
    timeTarget: (minutes) => `Time target: ${minutes} minutes`,
    loading: "Loading the week …",
  },
  briefing: {
    title: "Briefing",
    computedTitle: "Computed",
    savedTitle: "Your briefing",
    edit: "Edit",
    editTitle: "Edit briefing",
    hint: "Add to or shorten the text. It is saved in the week note.",
    save: "Save",
    cancel: "Cancel",
    sentences: {
      overdue: (count, refs) => `${matters(count, "is overdue", "are overdue")}: ${refs}.`,
      acute: (count, refs) => `${matters(count, "is acutely due", "are acutely due")}: ${refs}.`,
      "due-soon": (count, refs) =>
        `${matters(count, "is due in the next 14 days", "are due in the next 14 days")}: ${refs}.`,
      "ask-date": (count, refs) =>
        `${matters(count, "has no due date", "have no due date")}; ask for one: ${refs}.`,
      "todos-open": (count, refs) =>
        count === 1
          ? `1 to-do of your own is open: ${refs}.`
          : `${count} to-dos of your own are open: ${refs}.`,
      clarify: (count, refs) =>
        `${matters(count, "has no to-do for its next step", "have no to-do for their next step")}: ${refs}.`,
      "sources-new": (count, refs) =>
        count === 1
          ? `1 source came in this week: ${refs}.`
          : `${count} sources came in this week: ${refs}.`,
      "source-gaps": (count, refs) =>
        `${matters(count, "has no known source", "have no known source")}: ${refs}.`,
      quiet: () => "Nothing is due and nothing is open this week.",
    },
  },
  deadlines: {
    title: "Deadlines of the next 14 days",
    none: "Nothing is due in the next 14 days.",
    states: { overdue: "overdue", acute: "acute", soon: "soon" },
  },
  todos: { title: "Your to-dos", none: "No to-do is open." },
  coverage: {
    title: "Basis",
    sources: (count, thisWeek) =>
      `${count} sources taken into account, ${thisWeek} of them this week`,
    unchecked: (count) => `${count} unchecked (assigned to no matter)`,
    withoutSource: (count) => `${count} matters without a source`,
    withoutDate: (count) => `${count} matters without a due date`,
    noGaps: "no known gaps",
    scope:
      "The basis is the captured sources. The plugin reads no mailbox and does not know every message.",
  },
  errors: {
    changed: {
      title: "Briefing not saved",
      detail:
        "The week note was changed outside the plugin in the meantime. Open the briefing again and edit the current text.",
    },
  },
};
