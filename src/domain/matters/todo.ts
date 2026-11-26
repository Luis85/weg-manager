import { Schema } from "effect";
import {
  date,
  defineNoteType,
  draftValues,
  lineOfText,
  reference,
  required,
  text,
  type FormInput,
  type RecordValues,
} from "../notes";
import type { CalendarDay } from "../shell";
import { BOARD_ACTOR } from "./history";
import { TEXT_MAX_LENGTH, type MatterStatus } from "./matter-type";

/** Where a to-do stands (ENT-12, PBI-10): waiting needs a reason and a follow-up date. */
export const TODO_STATUSES = ["open", "waiting", "done", "dropped"] as const;
export type TodoStatus = (typeof TODO_STATUSES)[number];

/** Who does a to-do: the board (`board`) or a contact by id, as a history entry's actor. */
const Responsible = Schema.String.check(
  Schema.isPattern(new RegExp(`^(${BOARD_ACTOR}|contact-[0-9a-f-]{36})$`)),
);

/**
 * The to-do note, `weg-manager.todo/v1` (ENT-12, PBI-10; contract page
 * `docs/contracts/DV-04 - To-do v1.md`): the board's own next step, apart from anyone's promise.
 * One community, a matter optional. New notes go to `<rootFolder>/To-dos/`, named by the title.
 */
export const todoType = defineNoteType({
  type: "todo",
  version: 1,
  folder: "To-dos",
  fields: {
    title: required(text({ schema: lineOfText(TEXT_MAX_LENGTH), issue: "title.invalid" })),
    community_id: required(reference("community")),
    matter_id: reference("matter"),
    responsible: required(text({ schema: Responsible, issue: "responsible.invalid" })),
    status: required(text({ schema: Schema.Literals(TODO_STATUSES), issue: "status.unknown" })),
    due_on: date(),
    follow_up_on: date(),
    reason: text({ schema: lineOfText(TEXT_MAX_LENGTH), issue: "reason.invalid" }),
  },
  migrations: {},
});

export type TodoFields = typeof todoType.fields;
export type TodoKey = (typeof todoType.keys)[number];
export type TodoValues = RecordValues<TodoFields>;

/** What the to-do form holds: each field in the form of its kind. */
export type TodoInput = FormInput<TodoFields>;

/** One field's issue of a to-do, language-free (ADR 0005). */
export const TodoFieldIssue = Schema.Struct({
  key: Schema.Literals(todoType.keys),
  code: Schema.Literals([
    "field.missing",
    "field.reference",
    "field.date",
    "title.invalid",
    "responsible.invalid",
    "status.unknown",
    "reason.invalid",
    "reason.missing",
    "follow-up.missing",
    "matter.other-community",
  ]),
});
export type TodoFieldIssue = typeof TodoFieldIssue.Type;

/** What the rules know beyond the form: the community of each matter by id. */
export type TodoRuleContext = { readonly matterCommunities: ReadonlyMap<string, string> };

/** The rules of the status (PBI-10 criterion 2): waiting needs a reason and a follow-up date, dropping a reason. */
const statusIssues = (draft: ReturnType<typeof todoValues>): TodoFieldIssue[] => {
  const issues: TodoFieldIssue[] = [];
  if (draft.status === "waiting" && draft.follow_up_on === undefined) {
    issues.push({ key: "follow_up_on", code: "follow-up.missing" });
  }
  const needsReason = draft.status === "waiting" || draft.status === "dropped";
  if (needsReason && draft.reason === undefined)
    issues.push({ key: "reason", code: "reason.missing" });
  return issues;
};

/** A matter of another community than the to-do's (DF-12). */
const matterIssue = (
  draft: ReturnType<typeof todoValues>,
  context: TodoRuleContext,
): TodoFieldIssue[] => {
  const { matter_id: matter, community_id: community } = draft;
  if (matter === undefined || community === undefined) return [];
  const owner = context.matterCommunities.get(matter);
  return owner === undefined || owner === community
    ? []
    : [{ key: "matter_id", code: "matter.other-community" }];
};

/** The values a form saves: every text trimmed, a blank one unset. */
export const todoValues = (input: TodoInput) => draftValues(todoType, input);

/**
 * The rules a to-do must meet to be saved (PBI-10): the field rules of the note type, then the
 * status rules and a matter of the same community. At most one issue per field, field rules first.
 */
export const validateTodo = (
  input: TodoInput,
  context: TodoRuleContext,
): readonly TodoFieldIssue[] => {
  const draft = todoValues(input);
  const issues: TodoFieldIssue[] = todoType
    .check(draft)
    // `check` reports the type's own keys only.
    .map((issue) => ({ key: issue.key as TodoKey, code: issue.code }));
  const broken = new Set(issues.map((issue) => issue.key));
  for (const issue of [...statusIssues(draft), ...matterIssue(draft, context)]) {
    if (!broken.has(issue.key)) issues.push(issue);
  }
  return issues;
};

/** The group a to-do is shown in (VIEW-03): by its next date, closed ones apart. */
export type TodoGroup = "overdue" | "week" | "later" | "closed";

/** The Sunday that ends the week of `day` (Monday to Sunday). */
const endOfWeek = (day: CalendarDay): CalendarDay => {
  const time = Date.parse(`${day}T00:00:00Z`);
  const weekday = (new Date(time).getUTCDay() + 6) % 7;
  return new Date(time + (6 - weekday) * 86_400_000).toISOString().slice(0, 10);
};

/**
 * The group of a to-do on `today`: done and dropped ones are `closed`; else by its next date, the
 * follow-up date while it waits and the due date otherwise: before today `overdue`, up to Sunday
 * `week`, after it or without a date `later`. Days compare as text.
 */
export const todoGroup = (
  values: {
    readonly status?: TodoStatus | undefined;
    readonly due_on?: string | undefined;
    readonly follow_up_on?: string | undefined;
  },
  today: CalendarDay,
): TodoGroup => {
  if (values.status === "done" || values.status === "dropped") return "closed";
  const next = values.status === "waiting" ? values.follow_up_on : values.due_on;
  if (next === undefined) return "later";
  if (next < today) return "overdue";
  return next <= endOfWeek(today) ? "week" : "later";
};

/** Whether a to-do still carries a matter forward: open or waiting. */
const carries = (status: TodoStatus | undefined) => status === "open" || status === "waiting";

/**
 * The clarification list (PBI-10 criterion 4, owner decision 26.11.2026): the open and unclear
 * matters that no open or waiting to-do carries forward, in the order given.
 */
export const clarificationList = <
  M extends {
    readonly id: string | undefined;
    readonly values: { readonly status?: MatterStatus | undefined };
  },
>(
  matters: readonly M[],
  todos: readonly {
    readonly values: {
      readonly matter_id?: string | undefined;
      readonly status?: TodoStatus | undefined;
    };
  }[],
): M[] => {
  const carried = new Set(
    todos.flatMap((todo) =>
      carries(todo.values.status) && todo.values.matter_id !== undefined
        ? [todo.values.matter_id]
        : [],
    ),
  );
  return matters.filter(
    (matter) =>
      (matter.values.status === "open" || matter.values.status === "unclear") &&
      (matter.id === undefined || !carried.has(matter.id)),
  );
};
