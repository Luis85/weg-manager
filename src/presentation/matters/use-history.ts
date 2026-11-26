import { useForm } from "@tanstack/vue-form";
import { computed } from "vue";
import {
  addHistoryEntry,
  changeDue,
  changeStatus,
  matterHistory,
  type Matter,
} from "../../application/matters";
import {
  BOARD_ACTOR,
  correctedIds,
  validateDueChange,
  validateEntry,
  validateStatusChange,
  type EntryIssue,
  type EntryKind,
  type MatterStatus,
  type StatusChangeIssue,
} from "../../domain/matters";
import { useCommand, useMessages, useQuery } from "../shell";

/** A TanStack form over `defaults` whose submit runs `write`, then `done` once it has written. */
export const useWriteForm = <V>(
  defaults: V,
  write: (value: V) => Promise<{ readonly _tag: string }>,
  done: () => void,
) =>
  useForm({
    defaultValues: defaults,
    onSubmit: async ({ value }) => whenWritten(done)(await write(value)),
  });

/** Runs `done` once a form's command has written: on success only. */
export const whenWritten =
  (done: () => void) =>
  (outcome: { readonly _tag: string }): void => {
    if (outcome._tag === "success") done();
  };

/** Which field of the entry form an issue belongs to. */
const ENTRY_FIELD: Readonly<Record<EntryIssue, "text" | "occurred_on">> = {
  "text.missing": "text",
  "text.invalid": "text",
  "occurred-on.invalid": "occurred_on",
};

/** Which field of the status form an issue belongs to. */
const STATUS_FIELD: Readonly<Record<StatusChangeIssue, "to" | "reason" | "source" | "done_on">> = {
  "status.unchanged": "to",
  "reason.missing": "reason",
  "source.missing": "source",
  "done-on.missing": "done_on",
  "done-on.invalid": "done_on",
};

/** A matter's history read from its note (PBI-12): `reload` reads it again after a write. */
export const useHistoryList = (matter: () => Matter) => {
  const history = useQuery(matterHistory);
  const reload = () => history.run(matter());
  const lines = computed(() => history.value.value ?? []);
  const corrected = computed(() => correctedIds(lines.value));
  return { history, reload, lines, corrected };
};

/**
 * The form that adds an entry by hand (PBI-12): TanStack Form whose validators call
 * `validateEntry`; `done` runs once the entry is written.
 */
export const useEntryForm = (matter: () => Matter, done: () => void) => {
  const t = useMessages().matters.history;
  const command = useCommand(addHistoryEntry);
  const defaults: {
    kind: EntryKind;
    text: string;
    occurred_on: string;
    actor: string;
    source: string;
    corrects: string;
  } = { kind: "request", text: "", occurred_on: "", actor: BOARD_ACTOR, source: "", corrects: "" };
  const form = useForm({
    defaultValues: defaults,
    onSubmit: async ({ value }) => {
      const corrects = value.corrects === "" ? undefined : value.corrects;
      whenWritten(done)(await command.run(matter(), { ...value, corrects }));
    },
  });
  const issueOf =
    (field: "text" | "occurred_on") =>
    ({ value }: { value: string }) => {
      const found = validateEntry({ ...form.state.values, [field]: value }).find(
        (code) => ENTRY_FIELD[code] === field,
      );
      return found === undefined ? undefined : t.entryIssues[found];
    };
  const validators = (field: "text" | "occurred_on") => ({
    onChange: issueOf(field),
    onSubmit: issueOf(field),
  });
  return { t, form, command, validators };
};

/**
 * The form that changes the status with its reason (PBI-08): TanStack Form whose validators call
 * `validateStatusChange`; the done day starts as today. `done` runs once the change is written.
 */
export const useStatusForm = (matter: () => Matter, today: string, done: () => void) => {
  const t = useMessages().matters.history;
  const command = useCommand(changeStatus);
  const defaults: { to: MatterStatus; reason: string; source: string; done_on: string } = {
    to: "done",
    reason: "",
    source: "",
    done_on: today,
  };
  const form = useWriteForm(defaults, (value) => command.run(matter(), value), done);
  const issueOf =
    (field: "to" | "reason" | "source" | "done_on") =>
    ({ value }: { value: string }) => {
      const input = { ...form.state.values, [field]: value };
      const found = validateStatusChange({ ...input, from: matter().values.status }).find(
        (code) => STATUS_FIELD[code] === field,
      );
      return found === undefined ? undefined : t.statusIssues[found];
    };
  const validators = (field: "to" | "reason" | "source" | "done_on") => ({
    onSubmit: issueOf(field),
  });
  return { t, form, command, validators };
};

/**
 * The form that changes the due date with its reason (PBI-09): the new date (blank for none) with
 * its meaning, origin and check, prefilled with the current ones. TanStack Form whose validators
 * call `validateDueChange`. `done` runs once the change is written.
 */
export const useDueForm = (matter: () => Matter, done: () => void) => {
  const t = useMessages().matters.history;
  const command = useCommand(changeDue);
  const values = matter().values;
  const defaults: {
    due_on: string;
    due_kind: string;
    due_source: string;
    due_checked: string;
    reason: string;
  } = {
    due_on: values.due_on ?? "",
    due_kind: values.due_kind ?? "",
    due_source: values.due_source ?? "",
    due_checked: values.due_checked ?? "",
    reason: "",
  };
  const form = useWriteForm(defaults, (value) => command.run(matter(), value), done);
  const issueOf =
    (field: "due_on" | "reason") =>
    ({ value }: { value: string }) => {
      const found = validateDueChange({ ...form.state.values, [field]: value }).find(
        (code) => (code === "reason.missing" ? "reason" : "due_on") === field,
      );
      return found === undefined ? undefined : t.dueIssues[found];
    };
  const validators = (field: "due_on" | "reason") => ({ onSubmit: issueOf(field) });
  return { t, form, command, validators };
};
