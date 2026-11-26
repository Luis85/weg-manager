import { clarificationList, type MatterStatus, type TodoStatus } from "../matters";
import type { CalendarDay, Weekday } from "../shell";
import { WEEKDAYS } from "../shell";

/** At most this many sentences in a briefing (PBI-13 criterion 1). */
export const BRIEFING_MAX_SENTENCES = 7;

/** How many days ahead the deadlines reach (PBI-13 criterion 1). */
const DEADLINE_DAYS = 14;

const DAY = 86_400_000;

/** `day` plus `days` (negative for earlier), as a calendar day. */
export const addDays = (day: CalendarDay, days: number): CalendarDay =>
  new Date(Date.parse(`${day}T00:00:00Z`) + days * DAY).toISOString().slice(0, 10);

/** The first day of the week `today` lies in, when weeks start on `start`. */
export const weekStartOf = (today: CalendarDay, start: Weekday): CalendarDay => {
  const weekday = (new Date(Date.parse(`${today}T00:00:00Z`)).getUTCDay() + 6) % 7;
  const back = (weekday - WEEKDAYS.indexOf(start) + 7) % 7;
  return addDays(today, -back);
};

type MatterLike = {
  readonly id: string | undefined;
  readonly values: {
    readonly status?: MatterStatus | undefined;
    readonly due_on?: string | undefined;
    readonly source?: string | undefined;
  };
};
type TodoLike = {
  readonly id: string | undefined;
  readonly values: {
    readonly status?: TodoStatus | undefined;
    readonly due_on?: string | undefined;
    readonly follow_up_on?: string | undefined;
    readonly matter_id?: string | undefined;
  };
};
type SourceLike = {
  readonly id: string | undefined;
  readonly values: {
    readonly received_on?: string | undefined;
    readonly matter_ids?: readonly string[] | undefined;
  };
};

/** What the briefing is computed from: the records as the index holds them, when it is opened. */
export type BriefingInput = {
  readonly today: CalendarDay;
  readonly weekStart: Weekday;
  /** A deadline this many days ahead or fewer is acute (setting `acuteDays`). */
  readonly acuteDays: number;
  readonly matters: readonly MatterLike[];
  readonly todos: readonly TodoLike[];
  readonly sources: readonly SourceLike[];
};

/** How close a deadline is. */
export type DeadlineState = "overdue" | "acute" | "soon";

/** A matter's due date or a to-do's next date within the next 14 days, or before. */
export type Deadline = {
  readonly kind: "matter" | "todo";
  readonly id: string;
  readonly day: CalendarDay;
  readonly state: DeadlineState;
};

/** What a sentence of the briefing says; the catalog words it with its count. */
export type SentenceCode =
  | "overdue"
  | "acute"
  | "due-soon"
  | "ask-date"
  | "todos-open"
  | "clarify"
  | "sources-new"
  | "source-gaps"
  | "quiet";

/** One sentence: its code and the records it is about, which make it traceable. */
export type Sentence = { readonly code: SentenceCode; readonly ids: readonly string[] };

/** What the briefing took into account and what it knows it lacks (PBI-13 criterion 2). */
export type Coverage = {
  readonly weekOf: CalendarDay;
  readonly sources: number;
  readonly sourcesThisWeek: number;
  /** Sources no matter refers to: not checked yet. */
  readonly unchecked: readonly string[];
  readonly withoutSource: readonly string[];
  readonly withoutDate: readonly string[];
};

export type Briefing = {
  readonly sentences: readonly Sentence[];
  readonly deadlines: readonly Deadline[];
  readonly todos: readonly TodoLike[];
  readonly coverage: Coverage;
};

const isOpen = (status: MatterStatus | undefined) => status === "open" || status === "unclear";
const carries = (status: TodoStatus | undefined) => status === "open" || status === "waiting";
const idsOf = (records: readonly { readonly id: string | undefined }[]) =>
  records.flatMap((record) => (record.id === undefined ? [] : [record.id]));

/** The next date of a to-do: its follow-up while it waits, else its due date. */
const nextDay = (todo: TodoLike) =>
  todo.values.status === "waiting" ? todo.values.follow_up_on : todo.values.due_on;

/** The state of a deadline on `day`, or none beyond the next 14 days. */
const stateOf = (day: CalendarDay, input: BriefingInput): DeadlineState | undefined => {
  if (day < input.today) return "overdue";
  if (day <= addDays(input.today, input.acuteDays)) return "acute";
  return day <= addDays(input.today, DEADLINE_DAYS) ? "soon" : undefined;
};

/** The deadlines of open matters and open or waiting to-dos, by day, matters first on a day. */
const deadlinesOf = (input: BriefingInput): Deadline[] => {
  const entries: Deadline[] = [];
  const add = (kind: Deadline["kind"], id: string | undefined, day: string | undefined) => {
    const state = day === undefined ? undefined : stateOf(day, input);
    if (id !== undefined && day !== undefined && state !== undefined) {
      entries.push({ kind, id, day, state });
    }
  };
  for (const matter of input.matters) {
    if (isOpen(matter.values.status)) add("matter", matter.id, matter.values.due_on);
  }
  for (const todo of input.todos)
    if (carries(todo.values.status)) add("todo", todo.id, nextDay(todo));
  return entries.toSorted((a, b) => a.day.localeCompare(b.day) || b.kind.localeCompare(a.kind));
};

/** The sentence `code` about `ids`, or none when there is nothing to say. */
const sentence = (code: SentenceCode, ids: readonly string[]): Sentence[] =>
  ids.length === 0 ? [] : [{ code, ids }];

/**
 * The weekly briefing on opening (PBI-13, owner decision 26.11.2026): computed from the records,
 * never by a background run (K-04): the deadlines of the next 14 days, the board's own to-dos, at
 * most seven sentences in the order of urgency, each naming its records, and the coverage.
 */
export const weekBriefing = (input: BriefingInput): Briefing => {
  const deadlines = deadlinesOf(input);
  const matterIds = (state: DeadlineState) =>
    deadlines
      .filter((each) => each.kind === "matter" && each.state === state)
      .map((each) => each.id);
  const open = input.matters.filter((matter) => isOpen(matter.values.status));
  const withoutDate = idsOf(
    open.filter((matter) => matter.values.status === "open" && matter.values.due_on === undefined),
  );
  const withoutSource = idsOf(open.filter((matter) => matter.values.source === "unknown"));
  const todos = input.todos
    .filter((todo) => carries(todo.values.status))
    .toSorted((a, b) => (nextDay(a) ?? "9999").localeCompare(nextDay(b) ?? "9999"));
  const weekOf = weekStartOf(input.today, input.weekStart);
  const fresh = input.sources.filter((source) => (source.values.received_on ?? "") >= weekOf);
  const unchecked = idsOf(
    input.sources.filter((source) => (source.values.matter_ids ?? []).length === 0),
  );
  const sentences = [
    ...sentence("overdue", matterIds("overdue")),
    ...sentence("acute", matterIds("acute")),
    ...sentence("due-soon", matterIds("soon")),
    ...sentence("ask-date", withoutDate),
    ...sentence("todos-open", idsOf(todos)),
    ...sentence("clarify", idsOf(clarificationList(open, input.todos))),
    ...sentence("sources-new", idsOf(fresh)),
    ...sentence("source-gaps", withoutSource),
  ].slice(0, BRIEFING_MAX_SENTENCES);
  return {
    sentences: sentences.length === 0 ? [{ code: "quiet", ids: [] }] : sentences,
    deadlines,
    todos,
    coverage: {
      weekOf,
      sources: input.sources.length,
      sourcesThisWeek: fresh.length,
      unchecked,
      withoutSource,
      withoutDate,
    },
  };
};
