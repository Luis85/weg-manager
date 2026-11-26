import { useForm } from "@tanstack/vue-form";
import { computed } from "vue";
import { shownName as contactName, type Contact } from "../../application/contacts";
import {
  createTodo,
  describeTodoIssue,
  updateTodo,
  type Matter,
  type Todo,
} from "../../application/matters";
import {
  BOARD_ACTOR,
  TODO_STATUSES,
  todoType,
  validateTodo,
  type TodoInput,
} from "../../domain/matters";
import { useRecordForm } from "../notes";
import { useCommand, useMessages } from "../shell";
import { whenWritten } from "./use-history";

/** A choice of a native select: its value and what it shows. */
type Choice = { readonly value: string; readonly label: string };

/** The community of each matter by id, for the rule of the same community. */
const communitiesOf = (matters: readonly Matter[]) =>
  new Map(
    matters.flatMap((matter) =>
      matter.id === undefined || matter.values.community_id === undefined
        ? []
        : [[matter.id, matter.values.community_id] as const],
    ),
  );

/**
 * The to-do form's rules (PBI-10) on the notes module's record form (`useRecordForm`): the
 * validators call `validateTodo`. A new to-do starts open, by the board, with what `preset` gives
 * (the clarification list gives the matter, its community and its next step). The choices of
 * matter (those of the chosen community), responsible and status come from here.
 */
export const useTodoForm = (options: {
  readonly todo: Todo | undefined;
  readonly preset: Partial<TodoInput>;
  readonly matters: () => readonly Matter[];
  readonly contacts: () => readonly Contact[];
  readonly numbers: () => ReadonlyMap<string, string>;
  readonly root: () => HTMLElement | undefined;
  readonly done: (id: string) => void;
}) => {
  const catalog = useMessages();
  const t = catalog.matters.todos;
  const { todo } = options;
  const record = useRecordForm({
    type: todoType,
    record: todo,
    initial:
      todo === undefined ? { status: "open", responsible: BOARD_ACTOR, ...options.preset } : {},
    create: createTodo,
    update: updateTodo,
    invalid: "InvalidTodoError",
    rules: (input) => validateTodo(input, { matterCommunities: communitiesOf(options.matters()) }),
    describe: (issue) => describeTodoIssue(issue, catalog),
    labels: t.fields,
    summary: t.error,
    root: options.root,
    done: options.done,
  });
  const community = record.form.useSelector((state) => state.values.community_id);
  const matters = computed((): readonly Choice[] => [
    { value: "", label: t.noMatter },
    ...options.matters().flatMap((matter) =>
      matter.id === undefined || matter.values.community_id !== community.value
        ? []
        : [
            {
              value: matter.id,
              label:
                `${options.numbers().get(matter.id) ?? ""} ${matter.values.outcome ?? ""}`.trim(),
            },
          ],
    ),
  ]);
  const responsible = computed((): readonly Choice[] => [
    { value: BOARD_ACTOR, label: t.board },
    ...options
      .contacts()
      .flatMap((contact) =>
        contact.id === undefined ? [] : [{ value: contact.id, label: contactName(contact) }],
      ),
  ]);
  const statuses: readonly Choice[] = TODO_STATUSES.map((status) => ({
    value: status,
    label: t.statuses[status],
  }));
  return { ...record, t, matters, responsible, statuses, isNew: todo === undefined };
};

/** A quick entry as a full to-do input: open, by the board, without a matter. */
const quickInput = (value: { title: string; community_id: string; due_on: string }): TodoInput => ({
  ...value,
  matter_id: "",
  responsible: BOARD_ACTOR,
  status: "open",
  follow_up_on: "",
  reason: "",
});

/**
 * The quick entry of the to-dos (VIEW-03): a title, the community and a due date; the to-do starts
 * open, by the board, without a matter. TanStack Form whose submit runs `createTodo`, whose
 * validators call `validateTodo`; the title is cleared once it is written.
 */
export const useQuickTodo = (community: () => string) => {
  const catalog = useMessages();
  const command = useCommand(createTodo);
  const form = useForm({
    defaultValues: { title: "", community_id: community(), due_on: "" },
    onSubmit: async ({ value, formApi }) =>
      whenWritten(() => formApi.setFieldValue("title", ""))(await command.run(quickInput(value))),
  });
  const issueOf =
    (key: "title" | "community_id" | "due_on") =>
    ({ value }: { value: string }) => {
      const issue = validateTodo(quickInput({ ...form.state.values, [key]: value }), {
        matterCommunities: new Map(),
      }).find((each) => each.key === key);
      return issue === undefined ? undefined : describeTodoIssue(issue, catalog);
    };
  const validators = (key: "title" | "community_id" | "due_on") => ({ onSubmit: issueOf(key) });
  return { form, command, validators };
};
