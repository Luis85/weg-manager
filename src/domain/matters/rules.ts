import { Schema } from "effect";
import {
  draftValues,
  fitsFileName,
  isCalendarDate,
  type FormDraft,
  type FormInput,
} from "../notes";
import type { CalendarDay } from "../shell";
import { matterType, type MatterFields, type MatterKey, type MatterStatus } from "./matter-type";

/** What the matter form holds: each field in the form of its kind. */
export type MatterInput = FormInput<MatterFields>;

/** The values a form saves: trimmed, blank as unset. */
export type MatterDraft = FormDraft<MatterFields>;

/** The issue codes whose sentence needs nothing but the field's label. */
const MatterIssueCode = Schema.Literals([
  "field.missing",
  "field.reference",
  "field.references",
  "field.date",
  "field.number",
  "number.invalid",
  "number.taken",
  "number.duplicate",
  "kind.unknown",
  "status.unknown",
  "topic.invalid",
  "outcome.invalid",
  "outcome.too-long",
  "source.invalid",
  "next-step.invalid",
  "message-ref.invalid",
  "link.invalid",
  "done-on.missing",
  "done-on.not-done",
  "due-kind.unknown",
  "due-source.invalid",
  "due-checked.unknown",
]);

/** One field's issue, language-free (ADR 0005): the codec's codes and the matter rules (DV-03). */
export const MatterFieldIssue = Schema.Struct({
  key: Schema.Literals(matterType.keys),
  code: MatterIssueCode,
});
export type MatterFieldIssue = typeof MatterFieldIssue.Type;

/** What the rules need to know of another matter. */
export type OtherMatter = { readonly id: string | undefined; readonly number?: number | undefined };

export type MatterRuleContext = {
  /** The other matters; the edited one is not among them. */
  readonly others: readonly OtherMatter[];
  /** The values the edited matter had when the form loaded it: kept values are not checked. */
  readonly loaded?:
    { readonly number?: number | undefined; readonly outcome?: string | undefined } | undefined;
};

/** The number a new matter gets: the highest in the vault plus one (owner decision 26.11.2026). */
export const nextNumber = (numbers: readonly number[]): number =>
  numbers.reduce((highest, value) => Math.max(highest, value), 0) + 1;

/** Each number that more than one of `numbers` has: after a sync, two matters can share one. */
export const duplicateNumbers = (numbers: readonly number[]): ReadonlySet<number> => {
  const seen = new Set<number>();
  const duplicates = new Set<number>();
  for (const value of numbers) {
    if (seen.has(value)) duplicates.add(value);
    seen.add(value);
  }
  return duplicates;
};

/** The values a form saves from what it holds: every text trimmed, a blank one unset. */
export const matterValues = (input: MatterInput): MatterDraft => draftValues(matterType, input);

/** The rule between `status` and `done_on`: a done matter has its day, no other one has. */
const doneOnIssue = (draft: MatterDraft): MatterFieldIssue | undefined => {
  if (draft.status === "done" && draft.done_on === undefined) {
    return { key: "done_on", code: "done-on.missing" };
  }
  return draft.status !== "done" && draft.done_on !== undefined
    ? { key: "done_on", code: "done-on.not-done" }
    : undefined;
};

/** A number another matter has, unless the matter had it when loaded. */
const numberIssue = (
  draft: MatterDraft,
  context: MatterRuleContext,
): MatterFieldIssue | undefined => {
  const { number } = draft;
  if (number === undefined || number === context.loaded?.number) return undefined;
  return context.others.some((other) => other.number === number)
    ? { key: "number", code: "number.taken" }
    : undefined;
};

/** An outcome too long for a file name, unless the matter had it when loaded. */
const outcomeIssue = (
  draft: MatterDraft,
  context: MatterRuleContext,
): MatterFieldIssue | undefined => {
  const { outcome } = draft;
  if (outcome === undefined || outcome === context.loaded?.outcome) return undefined;
  return fitsFileName(outcome, `Vorgang ${String(draft.number ?? 0)}`)
    ? undefined
    : { key: "outcome", code: "outcome.too-long" };
};

/** The rules beyond each field, at most one per key. */
const ruleIssues = (draft: MatterDraft, context: MatterRuleContext): MatterFieldIssue[] =>
  [numberIssue(draft, context), outcomeIssue(draft, context), doneOnIssue(draft)].filter(
    (issue) => issue !== undefined,
  );

/**
 * The rules a matter must meet to be saved (PBI-05, DV-03): the field rules of the note type, then
 * a number no other matter has, an outcome that fits a file name, and `done_on` exactly for a
 * done matter. At most one issue per field, field rules first. Form and use cases call it.
 */
export const validateMatter = (
  input: MatterInput,
  context: MatterRuleContext,
): readonly MatterFieldIssue[] => {
  const draft = matterValues(input);
  const issues: MatterFieldIssue[] = matterType
    .check(draft)
    // `check` reports the type's own keys only.
    .map((issue) => ({ key: issue.key as MatterKey, code: issue.code }));
  const broken = new Set(issues.map((issue) => issue.key));
  for (const issue of ruleIssues(draft, context)) {
    if (!broken.has(issue.key)) issues.push(issue);
  }
  return issues;
};

/** A hint the plugin computes and never stores (DV-03). */
export type CheckMark = "overdue" | "ask_for_date";

/**
 * The check mark of a matter on `today`: `overdue` for an open or unclear one whose due date has
 * passed, `ask_for_date` for an open one without a due date, else none. Days compare as text.
 */
export const checkMark = (
  values: { readonly status?: MatterStatus | undefined; readonly due_on?: string | undefined },
  today: CalendarDay,
): CheckMark | undefined => {
  const { status, due_on: due } = values;
  if (status !== "open" && status !== "unclear") return undefined;
  if (due === undefined) return status === "open" ? "ask_for_date" : undefined;
  return due < today ? "overdue" : undefined;
};

/** What the matter list filters by (PBI-05 criterion 3); an unset part matches every matter. */
export type MatterFilter = {
  readonly search?: string | undefined;
  readonly topic?: string | undefined;
  readonly status?: MatterStatus | undefined;
  readonly community?: string | undefined;
  readonly responsible?: string | undefined;
};

type FilterValues = {
  readonly number?: number | undefined;
  readonly community_id?: string | undefined;
  readonly topic?: string | undefined;
  readonly outcome?: string | undefined;
  readonly next_step?: string | undefined;
  readonly responsible_id?: string | undefined;
  readonly status?: MatterStatus | undefined;
};

/** Whether `text` holds the search in any of the matter's texts or its number. */
const found = (values: FilterValues, search: string): boolean => {
  const wanted = search.trim().toLocaleLowerCase("de");
  if (wanted === "") return true;
  const texts = [values.topic, values.outcome, values.next_step];
  if (values.number !== undefined) texts.push(String(values.number).padStart(3, "0"));
  return texts.some((part) => part?.toLocaleLowerCase("de").includes(wanted) === true);
};

/** Whether a matter passes `filter`: the search and each set filter. */
export const matchesFilter = (values: FilterValues, filter: MatterFilter): boolean =>
  found(values, filter.search ?? "") &&
  (filter.topic === undefined || values.topic === filter.topic) &&
  (filter.status === undefined || values.status === filter.status) &&
  (filter.community === undefined || values.community_id === filter.community) &&
  (filter.responsible === undefined || values.responsible_id === filter.responsible);

/** Days between two days, as text `YYYY-MM-DD`. */
const daysBetween = (from: CalendarDay, to: CalendarDay): number =>
  Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);

/**
 * How many days a promise is old on `today` (PBI-09 criterion 4): none when the day of the promise
 * is unknown, never a made-up zero; an import keeps `promised_on`, so it never resets the age.
 */
export const promiseAge = (
  promisedOn: CalendarDay | undefined,
  today: CalendarDay,
): number | undefined => (promisedOn === undefined ? undefined : daysBetween(promisedOn, today));

/** Why a due date change cannot be made. */
export type DueChangeIssue = "reason.missing" | "due-on.invalid";

/**
 * The rules of a due date change (PBI-09): a reason, and a real day or none (no date asks for
 * one). The earlier date goes into the history, so the change is never silent.
 */
export const validateDueChange = (input: {
  readonly due_on: string;
  readonly reason: string;
}): readonly DueChangeIssue[] => {
  const issues: DueChangeIssue[] = [];
  if (input.reason.replace(/\s+/g, " ").trim() === "") issues.push("reason.missing");
  const day = input.due_on.trim();
  if (day !== "" && !isCalendarDate(day)) issues.push("due-on.invalid");
  return issues;
};
