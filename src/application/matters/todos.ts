import { Effect, Result } from "effect";
import {
  todoType,
  todoValues,
  validateTodo,
  type TodoFieldIssue,
  type TodoFields,
  type TodoInput,
  type TodoValues,
} from "../../domain/matters";
import { editedValues, type FormDraft, type MissingReference } from "../../domain/notes";
import { defineRecords, type RecordRow } from "../notes";
import { InvalidTodoError } from "./errors";
import { matterRecords } from "./list";

/** An issue of a to-do field: the codec's, the rules', or a missing community or matter. */
export type TodoIssue =
  TodoFieldIssue | (MissingReference & { readonly key: "community_id" | "matter_id" });

/** One to-do note as the screen shows it. */
export type Todo = RecordRow<TodoFields, TodoIssue>;

/** By the next date, earliest first; one without a date last, then by title. */
const byDate = (a: Todo, b: Todo): number => {
  const next = (todo: Todo) =>
    (todo.values.status === "waiting" ? todo.values.follow_up_on : todo.values.due_on) ?? "9999";
  return (
    next(a).localeCompare(next(b)) ||
    (a.values.title ?? "").localeCompare(b.values.title ?? "", "de")
  );
};

/**
 * The to-do records (ADR 0007, PBI-10): named and filed by their title, `To-do` when the title
 * leaves no usable file name, earliest date first. To-dos are never deleted; a dropped one stays.
 */
export const todoRecords = defineRecords({
  type: todoType,
  title: "title",
  fallbackName: () => "To-do",
  log: "todos",
  issue: (issue): TodoIssue => issue as TodoIssue,
  between: (todos) => todos.toSorted(byDate),
});

/** The to-dos now, for `useStream`. Never suspends. */
export const todoList = todoRecords.list;

/** The to-dos: the current list first, then each change. */
export const todoListChanges = todoRecords.changes;

/** The community of each matter by id: what the rule of the same community compares with. */
const matterCommunities = Effect.map(
  matterRecords.list,
  ({ records }) =>
    new Map(
      records.flatMap((matter) =>
        matter.id === undefined || matter.values.community_id === undefined
          ? []
          : [[matter.id, matter.values.community_id] as const],
      ),
    ),
);

/** The values to save, or the issues why not. */
const checked = (input: TodoInput, draft: FormDraft<TodoFields> = todoValues(input)) =>
  Effect.gen(function* () {
    const issues = validateTodo(input, { matterCommunities: yield* matterCommunities });
    if (issues.length > 0) return yield* Effect.fail(new InvalidTodoError({ issues }));
    const values = todoType.parse(draft);
    return Result.isSuccess(values)
      ? values.success
      : yield* Effect.die(new Error("validateTodo passed values the to-do type rejects."));
  });

/**
 * Creates a to-do (PBI-10): the rules, then a note named by its title in `<rootFolder>/To-dos/`.
 * It never writes the matter it belongs to: doing a step fulfils no one's promise (criterion 3).
 */
export const createTodo = (input: TodoInput) =>
  Effect.flatMap(checked(input), (values: TodoValues) => todoRecords.create(values));

/** Saves the form of `todo` (as it was loaded) with `input`, per field as the record kit merges. */
export const updateTodo = (todo: Todo, input: TodoInput) =>
  Effect.gen(function* () {
    const edited = editedValues(todoType, input, todoValues(input), todo.frontmatter);
    const values = yield* checked(input, edited);
    return yield* todoRecords.update(todo, values);
  });

/** Marks `todo` done in one step; its matter stays as it is (PBI-10 criterion 3). */
export const completeTodo = (todo: Todo) =>
  Effect.gen(function* () {
    const draft = { ...todo.values, status: "done" as const };
    const values = todoType.parse(draft);
    if (Result.isFailure(values)) {
      const issues = todoType.check(draft).map((issue) => issue as TodoFieldIssue);
      return yield* Effect.fail(new InvalidTodoError({ issues }));
    }
    return yield* todoRecords.update(todo, values.success);
  });
