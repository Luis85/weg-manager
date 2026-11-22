import { useForm } from "@tanstack/vue-form";
import { computed, nextTick, shallowRef } from "vue";
import type { AppServices } from "../../application/app-services";
import type { RecordRow, ReferenceSource } from "../../application/notes";
import type { AppError } from "../../application/errors";
import {
  formInput,
  type FieldConflict,
  type FormInput,
  type FormValue,
  type Frontmatter,
  type NoteFields,
  type NoteType,
  type RecordIssue,
} from "../../domain/notes";
import { useCommand, useMessages, useStream, type UseCaseFn } from "../shell";
import { shownValue, type ConflictChoices } from "./conflict";

/** A field's issue as the feature reports it: by key, with a code. */
type KeyedIssue = { readonly key: string; readonly code: string };

/** What a save returns: the note as written. */
type Written = { readonly frontmatter: Frontmatter };

/**
 * Puts the focus on the first field marked invalid in `root` (WCAG 3.3.1): an input, or the chosen
 * or first free option of a radio group.
 */
const focusFirstInvalid = (root: HTMLElement | undefined): void => {
  const invalid = root?.querySelector<HTMLElement>("[aria-invalid=true]");
  if (invalid === undefined || invalid === null) return;
  const target = invalid.matches("input")
    ? invalid
    : (invalid.querySelector<HTMLElement>("input:checked") ??
      invalid.querySelector<HTMLElement>("input:not(:disabled)"));
  target?.focus();
};

export type RecordFormOptions<F extends NoteFields, Issue extends KeyedIssue> = {
  readonly type: NoteType<F>;
  /** The record being edited, as the list showed it; none creates one. */
  readonly record: RecordRow<F, Issue> | undefined;
  /** Start values of a new record beside the empty ones (a community's first free colour). */
  readonly initial?: Partial<FormInput<F>>;
  /** The feature's use cases: they check its rules and write through the notes module's kit. */
  readonly create: UseCaseFn<[FormInput<F>], Written, AppError>;
  readonly update: UseCaseFn<[RecordRow<F, Issue>, FormInput<F>], Written, AppError>;
  /** The tag of the feature's error whose `issues` land at their fields. */
  readonly invalid: AppError["_tag"];
  /** The feature's rules for the input as it stands: what each field's validator reports. */
  readonly rules: (input: FormInput<F>) => readonly Issue[];
  /** An issue in the feature's words (`describeRecordIssue` with its texts). */
  readonly describe: (issue: RecordIssue | Issue) => string;
  /** The label of each field: the conflict's legend names the field by it. */
  readonly labels: Readonly<Record<keyof F & string, string>>;
  /**
   * The target of each reference field, by its key, so the conflict choice shows a referenced
   * record by its name; a field without one shows the ids.
   */
  readonly references?: Partial<Readonly<Record<keyof F & string, ReferenceSource<AppServices>>>>;
  /** The summary a failed submit shows at the top of the form. */
  readonly summary: { readonly title: string; readonly detail: string };
  readonly root: () => HTMLElement | undefined;
  /** Called with the id of the record that was saved. */
  readonly done: (id: string) => void;
};

/**
 * The state and flow of a record's form, apart from its markup and the feature's rules (TanStack
 * Form). Each field's validators call `rules`; the use case has the final word, and the issues of
 * the feature's `invalid` error land at their fields. A failed submit shows a summary and moves the
 * focus to the first invalid field. A field shows the note's own issue until the user changes it.
 * An outside edit to a field the user changed too shows the conflict choice; the form then saves
 * again against the note's current values (ADR 0007). Save stays focusable: `blocked` says when it
 * does nothing (`aria-disabled`).
 */
export const useRecordForm = <F extends NoteFields, Issue extends KeyedIssue>(
  options: RecordFormOptions<F, Issue>,
) => {
  type Key = keyof F & string;
  type Input = FormInput<F>;
  const { record } = options;

  /** The frontmatter the save compares with; after a conflict, the note's values the user saw. */
  const base = shallowRef<Frontmatter>(record?.frontmatter ?? {});
  const conflicts = shallowRef<readonly FieldConflict[] | undefined>();
  /** A submit failed on the rules: the summary at the top stays until the fields are valid. */
  const failed = shallowRef(false);
  const create = useCommand(options.create);
  const update = useCommand(options.update);
  const command = record === undefined ? create : update;

  const showInvalid = async () => {
    failed.value = true;
    await nextTick();
    focusFirstInvalid(options.root());
  };

  // Each field in the form of its kind (PBI-71): a list stays a list, a number a number.
  const loaded: Input = formInput(options.type, record?.frontmatter ?? {});

  const form = useForm({
    defaultValues: { ...loaded, ...options.initial },
    // A submit checks every field, also after an earlier one failed; invalid input never saves.
    canSubmitWhenInvalid: true,
    onSubmitInvalid: () => void showInvalid(),
    onSubmit: async ({ value }) => {
      conflicts.value = undefined;
      const outcome =
        record === undefined
          ? await create.run(value)
          : await update.run({ ...record, frontmatter: base.value }, value);
      await settled(outcome);
    },
  });

  /**
   * Puts `error` at each field it names. The names come from the form's own fields, which TanStack
   * types by the form's data; a field the feature does not show has no place to show an issue.
   */
  const markFields = (errors: ReadonlyMap<string, string>) => {
    for (const name in form.fieldInfo) {
      const error = errors.get(name);
      if (error === undefined) continue;
      form.setFieldMeta(name, (meta) => ({
        ...meta,
        errorMap: { ...meta.errorMap, onSubmit: error },
      }));
    }
  };

  /**
   * After a save, by its outcome: done with the saved record's id, a conflict to choose in, or the
   * use case's issues at their fields. A defect (reported as a notice) or an interruption keeps
   * the form open with the user's input, as anything but a success must.
   */
  const settled = async (outcome: Awaited<ReturnType<typeof command.run>>) => {
    if (outcome._tag === "success") return saved(outcome.value);
    if (outcome._tag !== "failure") return;
    const { error } = outcome;
    if (error._tag === "NoteEditConflictError") conflicts.value = error.conflicts;
    const issues = fieldIssues(error);
    if (issues === undefined) return;
    markFields(new Map(issues.map((issue) => [issue.key, options.describe(issue)])));
    await showInvalid();
  };
  /** The id of the record the save wrote: the edited one's, or the new note's. */
  const saved = (written: Written) => {
    const id = record?.id ?? written.frontmatter["id"];
    if (typeof id === "string") options.done(id);
  };
  /** The issues of the feature's `invalid` error, which land at their fields. */
  const fieldIssues = (error: AppError): readonly Issue[] | undefined =>
    error._tag === options.invalid && "issues" in error
      ? (error.issues as readonly Issue[])
      : undefined;

  /** The rule's issue for `key` if the field held `value`, worded; `undefined` when it is fine. */
  const issueOf =
    (key: Key) =>
    ({ value }: { value: FormValue }) => {
      const input: Input = { ...form.state.values, [key]: value };
      const issue = options.rules(input).find((candidate) => candidate.key === key);
      return issue === undefined ? undefined : options.describe(issue);
    };
  const validators = (key: Key) => ({ onChange: issueOf(key), onSubmit: issueOf(key) });

  /** The note's own issue at `key`, shown until the user changes the field. */
  const loadedIssue = (key: Key): string | undefined => {
    const issue = record?.issues.find((candidate) => "key" in candidate && candidate.key === key);
    return issue === undefined ? undefined : options.describe(issue);
  };

  const errorOf = (
    key: Key,
    meta: { readonly errors: readonly unknown[]; readonly isDirty: boolean },
  ): string | false => {
    const first = meta.errors.find((error) => typeof error === "string" && error !== "");
    if (typeof first === "string") return first;
    return meta.isDirty ? false : (loadedIssue(key) ?? false);
  };

  const isSubmitting = form.useSelector((state) => state.isSubmitting);
  const fieldsValid = form.useSelector((state) => state.isFieldsValid);
  const pending = computed(() => isSubmitting.value || command.pending.value);
  /** Save does nothing now; the button says so (`aria-disabled`) but keeps its focus. */
  const blocked = computed(() => pending.value || conflicts.value !== undefined);
  const submit = () => (blocked.value ? Promise.resolve() : form.handleSubmit());

  /**
   * Takes the user's choice per field and saves again against the note's current values. The
   * choice is settled once applied: a chosen value that breaks a rule (an emptied property) stays
   * in an editable form with its field's issue, and the next save goes against the same values.
   */
  const resolve = (choices: ConflictChoices) => {
    const next: Record<string, unknown> = { ...base.value };
    for (const conflict of conflicts.value ?? []) {
      if (conflict.current === undefined) delete next[conflict.key];
      else next[conflict.key] = conflict.current;
    }
    // "theirs" puts the note's value into the form through the same mapping as loading does.
    const current = formInput(options.type, next);
    const theirs = Object.fromEntries(
      Object.entries(current).filter(([key]) => choices[key] === "theirs"),
    );
    form.baseStore.setState((state) => ({ ...state, values: { ...state.values, ...theirs } }));
    base.value = next;
    conflicts.value = undefined;
    void form.handleSubmit();
  };

  /** The summary of a failed submit (WCAG 3.3.1), until every field is valid again. */
  const summary = computed(() =>
    failed.value && !fieldsValid.value
      ? { severity: "warning" as const, ...options.summary }
      : undefined,
  );
  /** Field issues stand at their fields and a conflict has its own view; anything else here. */
  const notice = computed(() => {
    const tag = command.error.value?._tag;
    return tag === options.invalid || tag === "NoteEditConflictError"
      ? undefined
      : command.message.value;
  });
  /** A field's label, for the conflict's legend. */
  const label = (key: string): string => options.labels[key as Key];

  const conflictTexts = useMessages().notes.conflict;
  const names = new Map(
    Object.entries(options.references ?? {}).flatMap(([key, source]) =>
      source === undefined ? [] : [[key, useStream(source.names, source.nameChanges)] as const],
    ),
  );
  /** A field's value as the conflict shows it, in the form of the field's kind. */
  const show = (key: string, value: unknown): string => {
    const kind = options.type.fields[key]?.kind ?? "text";
    return shownValue(kind, value, conflictTexts, names.get(key)?.value);
  };

  return {
    form,
    conflicts,
    validators,
    errorOf,
    submit,
    resolve,
    label,
    show,
    pending,
    blocked,
    summary,
    notice,
  };
};
