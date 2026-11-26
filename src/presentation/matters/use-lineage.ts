import { useForm } from "@tanstack/vue-form";
import { computed } from "vue";
import { mergeMatters, splitMatter, type Matter } from "../../application/matters";
import {
  mergeConflicts,
  validateMerge,
  validateSplit,
  type MergeKey,
  type SplitPart,
} from "../../domain/matters";
import { useCommand, useMessages } from "../shell";
import { useWriteForm, whenWritten } from "./use-history";

/** An empty part: open, without a due date. */
export const emptyPart = (): SplitPart => ({
  outcome: "",
  responsible_id: "",
  due_on: "",
  status: "open",
  next_step: "",
});

/**
 * The form that splits a matter into parts (PBI-06): the reason and two or more parts. TanStack
 * Form whose validators call `validateSplit`; the parts' issues are named by part. `done` runs
 * once the split is written.
 */
export const useSplitForm = (matter: () => Matter, done: () => void) => {
  const t = useMessages().matters.history;
  const command = useCommand(splitMatter);
  const defaults: { reason: string; parts: SplitPart[] } = {
    reason: "",
    parts: [emptyPart(), emptyPart()],
  };
  const form = useWriteForm(defaults, (value) => command.run(matter(), value), done);
  const validators = {
    reason: {
      onSubmit: ({ value }: { value: string }) => {
        const found = validateSplit({ ...form.state.values, reason: value }).find(
          (issue) => issue.code === "reason.missing",
        );
        return found === undefined ? undefined : t.splitIssues[found.code];
      },
    },
    parts: {
      onSubmit: ({ value }: { value: SplitPart[] }) => {
        const found = validateSplit({ ...form.state.values, parts: value }).filter(
          (issue) => issue.code !== "reason.missing",
        );
        if (found.length === 0) return undefined;
        return found
          .map((issue) =>
            issue.part === undefined
              ? t.splitIssues[issue.code]
              : `${t.splitPart(issue.part + 1)}: ${t.splitIssues[issue.code]}`,
          )
          .join(" ");
      },
    },
  };
  return { t, form, command, validators };
};

/**
 * The form that merges a duplicate into `matter` (PBI-07): the duplicate, chosen among the other
 * open matters of the same community, a choice per field where the two differ (the target's value
 * by default), and the reason. `done` runs once the merge is written.
 */
export const useMergeForm = (
  matter: () => Matter,
  matters: () => readonly Matter[],
  done: () => void,
) => {
  const t = useMessages().matters.history;
  const command = useCommand(mergeMatters);
  const candidates = computed(() =>
    matters().filter(
      (other) =>
        other.id !== undefined &&
        other.id !== matter().id &&
        other.editable &&
        other.values.community_id === matter().values.community_id &&
        other.values.merged_into_id === undefined &&
        other.values.split_into_ids === undefined,
    ),
  );
  const defaults: {
    duplicate: string;
    reason: string;
    choices: Partial<Record<MergeKey, "target" | "duplicate">>;
  } = { duplicate: candidates.value[0]?.id ?? "", reason: "", choices: {} };
  const duplicateOf = (id: string) => candidates.value.find((other) => other.id === id);
  const form = useForm({
    defaultValues: defaults,
    onSubmit: async ({ value }) => {
      const duplicate = duplicateOf(value.duplicate);
      if (duplicate === undefined) return;
      whenWritten(done)(await command.run(matter(), duplicate, value));
    },
  });
  const selected = form.useSelector((state) => state.values.duplicate);
  const conflicts = computed(() => {
    const duplicate = duplicateOf(selected.value);
    return duplicate === undefined ? [] : mergeConflicts(matter().values, duplicate.values);
  });
  const validators = {
    reason: {
      onSubmit: ({ value }: { value: string }) => {
        const duplicate = duplicateOf(form.state.values.duplicate);
        if (duplicate === undefined) return undefined;
        const found = validateMerge(
          { id: matter().id, ...matter().values },
          { id: duplicate.id, ...duplicate.values },
          value,
        )[0];
        return found === undefined ? undefined : t.mergeIssues[found];
      },
    },
  };
  return { t, form, command, validators, candidates, conflicts };
};
