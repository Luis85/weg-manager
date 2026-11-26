import { promiseAge, type MatterStatus } from "../matters";
import type { CalendarDay, Weekday } from "../shell";
import { addDays, weekStartOf } from "./briefing";

/** What the selection is computed from: the matters, the day and the week's settings. */
export type SelectionInput = {
  readonly today: CalendarDay;
  readonly weekStart: Weekday;
  /** A due date this many days ahead or fewer is urgent (setting `acuteDays`). */
  readonly acuteDays: number;
  /** The regular decisions of the week (setting `weekDecisions`, K-05). */
  readonly budget: number;
  readonly matters: readonly {
    readonly id: string | undefined;
    readonly values: {
      readonly status?: MatterStatus | undefined;
      readonly community_id?: string | undefined;
      readonly due_on?: string | undefined;
      readonly promised_on?: string | undefined;
    };
  }[];
};

/** Why a matter is put forward: urgent ones by their date, regular ones by date or by age. */
export type SelectionReason = "overdue" | "due-this-week" | "due" | "age" | "age-unknown";

/** One candidate: the matter, why it is put forward, its due date and its age in days. */
export type Candidate = {
  readonly id: string;
  readonly reason: SelectionReason;
  readonly due: CalendarDay | undefined;
  /** Days since the promise; undefined when the day of the promise is unknown, never 0. */
  readonly age: number | undefined;
};

export type Selection = {
  /** Outside the budget, all of them visible (DF-09). */
  readonly urgent: readonly Candidate[];
  /** At most `budget`, over every community together. */
  readonly selected: readonly Candidate[];
  /** The regular work not chosen this week, still visible (criterion 4). */
  readonly backlog: readonly Candidate[];
  readonly budget: number;
};

/** The day by which a due date makes a matter urgent: the acute deadline or the week's end. */
const urgentUntil = (input: SelectionInput): CalendarDay => {
  const acute = addDays(input.today, input.acuteDays);
  const weekEnd = addDays(weekStartOf(input.today, input.weekStart), 6);
  return acute > weekEnd ? acute : weekEnd;
};

/** The candidate of a matter: urgent ones first by date, regular ones by date, then by age. */
const candidateOf = (
  id: string,
  values: SelectionInput["matters"][number]["values"],
  input: SelectionInput,
  until: CalendarDay,
): Candidate => {
  const due = values.due_on;
  const age = promiseAge(values.promised_on, input.today);
  if (due !== undefined && due < input.today) return { id, reason: "overdue", due, age };
  if (due !== undefined && due <= until) return { id, reason: "due-this-week", due, age };
  if (due !== undefined) return { id, reason: "due", due, age: undefined };
  return { id, reason: age === undefined ? "age-unknown" : "age", due, age };
};

/** Nearest due date first; without one, the oldest promise first; an unknown age last. */
const byUrgency = (a: Candidate, b: Candidate): number => {
  if (a.due !== undefined || b.due !== undefined) {
    return (a.due ?? "9999").localeCompare(b.due ?? "9999");
  }
  return (b.age ?? -1) - (a.age ?? -1);
};

/** Whether a candidate is urgent: outside the budget. */
const isUrgent = (candidate: Candidate) =>
  candidate.reason === "overdue" || candidate.reason === "due-this-week";

/**
 * The decisions of the week (PBI-14, DF-09, K-05; owner decision 26.11.2026): every open or
 * unclear matter is a candidate, computed on opening and never stored. Overdue ones and those due
 * by the acute deadline or the end of the week are urgent: outside the budget and all shown. Of
 * the rest, the `budget` most urgent over every community are selected, by due date, then by the
 * age of the promise; the others stay visible as backlog. An unknown age stays unknown.
 */
export const decisionSelection = (input: SelectionInput): Selection => {
  const until = urgentUntil(input);
  const candidates = input.matters
    .flatMap((matter) =>
      matter.id !== undefined &&
      (matter.values.status === "open" || matter.values.status === "unclear")
        ? [candidateOf(matter.id, matter.values, input, until)]
        : [],
    )
    .toSorted(byUrgency);
  const regular = candidates.filter((candidate) => !isUrgent(candidate));
  return {
    urgent: candidates.filter(isUrgent),
    selected: regular.slice(0, input.budget),
    backlog: regular.slice(input.budget),
    budget: input.budget,
  };
};
