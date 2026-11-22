import { useForm } from "@tanstack/vue-form";
import { computed, nextTick, shallowRef } from "vue";
import {
  canChangeShortCode,
  createCommunity,
  describeCommunityIssue,
  shownName,
  updateCommunity,
  type Community,
} from "../../application/communities";
import {
  colorOwners,
  firstFreeColor,
  kindSuggestions,
  validateCommunity,
  type CommunityFieldIssue,
  type CommunityInput,
  type CommunityKey,
  type KindPair,
} from "../../domain/communities";
import { useCommand, useMessages } from "../shell";
import type { ConflictChoices, FieldConflict } from "./conflict";

/** A value of the note as the form shows it: text as written, numbers and flags as text. */
const rawText = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : "";

/**
 * Puts the focus on the first field marked invalid in `root` (WCAG 3.3.1): an input, or the chosen
 * or first free colour of a radio group.
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

/**
 * The state and rules of the community form (handoff CommunityForm), apart from its markup. The
 * validators call the domain rule (`validateCommunity`); the use case has the final word, and its
 * issues land at their fields. A failed submit shows a summary and moves the focus to the first
 * invalid field. An outside edit to a field the user changed too shows the conflict choice; the
 * form then saves again against the note's current values (ADR 0007). `done` gets the id of the
 * community that was saved.
 */
export const useCommunityForm = (options: {
  readonly community: Community | undefined;
  readonly communities: () => readonly Community[];
  readonly root: () => HTMLElement | undefined;
  readonly done: (id: string) => void;
}) => {
  const catalog = useMessages();
  const t = catalog.communities;
  const { community } = options;
  const loaded = community?.values;
  const shortCodeEditable = community === undefined || canChangeShortCode(community);

  /** The other communities' valid values and the name each is shown by: what the rules compare. */
  const others = computed(() =>
    options
      .communities()
      .filter((other) => community === undefined || other.id !== community.id)
      .map((other) => ({ ...other.values, name: shownName(other) })),
  );
  /** The colours other communities use, each with its owner's short code. */
  const taken = computed(() => {
    const owners = new Map(colorOwners(others.value));
    if (loaded?.color !== undefined) owners.delete(loaded.color);
    return owners;
  });
  const suggestions = computed(() => kindSuggestions(t.builtInKinds, others.value));
  const loadedText = (key: CommunityKey) => rawText(community?.frontmatter[key]);

  /** The frontmatter the save compares with; after a conflict, the note's values the user saw. */
  const base = shallowRef(community?.frontmatter ?? {});
  const conflicts = shallowRef<readonly FieldConflict[] | undefined>();
  /** A submit failed on the rules: the summary at the top stays until the fields are valid. */
  const failed = shallowRef(false);
  const create = useCommand(createCommunity);
  const update = useCommand(updateCommunity);
  const command = community === undefined ? create : update;

  /** What the rules see: a fixed short code stays as loaded, whatever the field holds. */
  const effective = (input: CommunityInput): CommunityInput =>
    shortCodeEditable ? input : { ...input, short_code: loaded?.short_code ?? input.short_code };
  const describe = (issue: CommunityFieldIssue) => describeCommunityIssue(issue, catalog);

  const showInvalid = async () => {
    failed.value = true;
    await nextTick();
    focusFirstInvalid(options.root());
  };

  const form = useForm({
    defaultValues: {
      name: loadedText("name"),
      short_code: loadedText("short_code"),
      color: community === undefined ? (firstFreeColor(others.value) ?? "") : loadedText("color"),
      kind: loadedText("kind"),
      unit_label: loadedText("unit_label"),
    } satisfies CommunityInput,
    // A submit checks every field, also after an earlier one failed; invalid input never saves.
    canSubmitWhenInvalid: true,
    onSubmitInvalid: () => void showInvalid(),
    onSubmit: async ({ value }) => {
      conflicts.value = undefined;
      if (community === undefined) await create.run(value);
      else await update.run({ ...community, frontmatter: base.value }, value);
      await settled();
    },
  });

  /** The id of the community the command saved, once it saved one. */
  const savedId = (): unknown =>
    command.value.value === undefined
      ? undefined
      : (community?.id ?? create.value.value?.frontmatter["id"]);

  /** After a save: done, a conflict to choose in, or the use case's issues at their fields. */
  const settled = async () => {
    const error = command.error.value;
    const id = savedId();
    if (error === undefined) {
      if (typeof id === "string") options.done(id);
      return;
    }
    if (error._tag === "NoteEditConflictError") conflicts.value = error.conflicts;
    if (error._tag !== "InvalidCommunityError") return;
    for (const issue of error.issues) {
      form.setFieldMeta(issue.key, (meta) => ({
        ...meta,
        errorMap: { ...meta.errorMap, onSubmit: describe(issue) },
      }));
    }
    await showInvalid();
  };

  /** The rule's issue for `key` if the field held `value`, worded; `undefined` when it is fine. */
  const issueOf =
    (key: CommunityKey) =>
    ({ value }: { value: string }) => {
      if (key === "short_code" && !shortCodeEditable) return undefined;
      const input = effective({ ...form.state.values, [key]: value });
      const issue = validateCommunity(input, { others: others.value, loaded }).find(
        (candidate) => candidate.key === key,
      );
      return issue === undefined ? undefined : describe(issue);
    };
  const validators = (key: CommunityKey) => ({ onChange: issueOf(key), onSubmit: issueOf(key) });

  /** The note's own issue at `key`, shown until the user changes the field. */
  const loadedIssue = (key: CommunityKey): string | undefined => {
    const issue = community?.issues.find(
      (candidate) => "key" in candidate && candidate.key === key,
    );
    return issue === undefined ? undefined : describeCommunityIssue(issue, catalog);
  };

  const errorOf = (
    key: CommunityKey,
    meta: { readonly errors: readonly unknown[]; readonly isDirty: boolean },
  ): string | false => {
    const first = meta.errors.find((error) => typeof error === "string" && error !== "");
    if (typeof first === "string") return first;
    return meta.isDirty ? false : (loadedIssue(key) ?? false);
  };

  /** Choosing a kind fills its unit label, which stays editable. */
  const choose = (pair: KindPair) => {
    form.setFieldValue("kind", pair.kind);
    form.setFieldValue("unit_label", pair.unit_label);
  };
  /** What the user typed into a text field; a typed kind that is a suggestion fills its label. */
  const typed = (key: CommunityKey, change: (value: string) => void, value: string) => {
    change(value);
    if (key !== "kind") return;
    const pair = suggestions.value.find((candidate) => candidate.kind === value.trim());
    if (pair !== undefined) form.setFieldValue("unit_label", pair.unit_label);
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
      if (choices[conflict.key] === "theirs") {
        form.setFieldValue(conflict.key as CommunityKey, rawText(conflict.current));
      }
    }
    base.value = next;
    conflicts.value = undefined;
    void form.handleSubmit();
  };

  /** The summary of a failed submit (WCAG 3.3.1), until every field is valid again. */
  const summary = computed(() =>
    failed.value && !fieldsValid.value
      ? { severity: "warning" as const, ...t.errors.invalid }
      : undefined,
  );
  /** Field issues stand at their fields and a conflict has its own view; anything else here. */
  const notice = computed(() => {
    const tag = command.error.value?._tag;
    return tag === "InvalidCommunityError" || tag === "NoteEditConflictError"
      ? undefined
      : command.message.value;
  });

  return {
    form,
    t,
    shortCodeEditable,
    taken,
    suggestions,
    conflicts,
    validators,
    errorOf,
    choose,
    typed,
    submit,
    resolve,
    pending,
    blocked,
    summary,
    notice,
  };
};
