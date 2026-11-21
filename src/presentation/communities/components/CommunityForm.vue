<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UFormField from "@nuxt/ui/components/FormField.vue";
import UInput from "@nuxt/ui/components/Input.vue";
import { useForm } from "@tanstack/vue-form";
import { computed, shallowRef } from "vue";
import {
  canChangeShortCode,
  createCommunity,
  describeCommunityIssue,
  updateCommunity,
  type Community,
} from "../../../application/communities";
import {
  colorsInUse,
  kindSuggestions,
  validateCommunity,
  type CommunityFieldIssue,
  type CommunityInput,
  type CommunityKey,
  type KindPair,
} from "../../../domain/communities";
import { ErrorNotice, useCommand, useMessages } from "../../shell";
import ColorField from "./ColorField.vue";
import ConflictChoice, { type ConflictChoices, type FieldConflict } from "./ConflictChoice.vue";

/**
 * Creates a community or edits one (`community` set), in one form (handoff CommunityForm). The
 * validators call the domain rule (`validateCommunity`); the use case has the final word, and its
 * issues land at their fields. An outside edit to a field the user changed too shows the conflict
 * choice; the form then saves again against the note's current values (ADR 0007).
 */
const props = defineProps<{
  community?: Community | undefined;
  communities: readonly Community[];
}>();
const emit = defineEmits<{ done: []; cancel: [] }>();

const catalog = useMessages();
const t = catalog.communities;
const community = props.community;
const loaded = community?.values;
const shortCodeEditable = community === undefined || canChangeShortCode(community);

const others = computed(() =>
  props.communities
    .filter((other) => community === undefined || other.id !== community.id)
    .map((other) => other.values),
);
const taken = computed(() => {
  const colors = new Set(colorsInUse(others.value));
  if (loaded?.color !== undefined) colors.delete(loaded.color);
  return colors;
});
const suggestions = computed(() => kindSuggestions(t.builtInKinds, others.value));

/** A value of the note as the form shows it: text as written, numbers and flags as text. */
const rawText = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : "";
const loadedText = (key: CommunityKey) => rawText(community?.frontmatter[key]);

/** The frontmatter the save compares with; after a conflict, the note's values the user saw. */
const base = shallowRef(community?.frontmatter ?? {});
const conflicts = shallowRef<readonly FieldConflict[] | undefined>();
const create = useCommand(createCommunity);
const update = useCommand(updateCommunity);
const command = community === undefined ? create : update;

/** What the rules see: a fixed short code stays as loaded, whatever the field holds. */
const effective = (input: CommunityInput): CommunityInput =>
  shortCodeEditable ? input : { ...input, short_code: loaded?.short_code ?? input.short_code };
const describe = (issue: CommunityFieldIssue) => describeCommunityIssue(issue, catalog);

const form = useForm({
  defaultValues: {
    name: loadedText("name"),
    short_code: loadedText("short_code"),
    color: loadedText("color"),
    kind: loadedText("kind"),
    unit_label: loadedText("unit_label"),
  } satisfies CommunityInput as CommunityInput,
  // A submit checks every field, also after an earlier one failed; invalid input never saves.
  canSubmitWhenInvalid: true,
  onSubmit: async ({ value }) => {
    conflicts.value = undefined;
    if (community === undefined) await create.run(value);
    else await update.run({ ...community, frontmatter: base.value }, value);
    const error = command.error.value;
    if (error === undefined) {
      if (command.value.value !== undefined) emit("done");
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
  },
});

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
  const issue = community?.issues.find((candidate) => "key" in candidate && candidate.key === key);
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

const submit = () => form.handleSubmit();

/** Takes the user's choice per field and saves again against the note's current values. */
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
  void submit();
};

const isSubmitting = form.useSelector((state) => state.isSubmitting);
const pending = computed(() => isSubmitting.value || command.pending.value);
/** Field issues stand at their fields and a conflict has its own view; anything else here. */
const notice = computed(() => {
  const tag = command.error.value?._tag;
  return tag === "InvalidCommunityError" || tag === "NoteEditConflictError"
    ? undefined
    : command.message.value;
});
const textFields = ["name", "kind", "unit_label"] as const;
</script>

<template>
  <form
    class="wm:flex wm:flex-col wm:gap-4"
    novalidate
    data-testid="community-form"
    @submit.prevent="submit"
  >
    <form.Field name="name" :validators="validators('name')">
      <template #default="{ field }">
        <UFormField
          :label="t.fields.name"
          :name="field.name"
          :error="errorOf('name', field.state.meta)"
          required
        >
          <UInput
            :model-value="field.state.value"
            class="wm:w-full"
            data-testid="field-name"
            @update:model-value="(next: string | number) => field.handleChange(String(next))"
            @blur="field.handleBlur"
          />
        </UFormField>
      </template>
    </form.Field>
    <form.Field name="short_code" :validators="validators('short_code')">
      <template #default="{ field }">
        <UFormField
          :label="t.fields.short_code"
          :name="field.name"
          :help="shortCodeEditable ? t.shortCodeHint : t.shortCodeFixed"
          :error="errorOf('short_code', field.state.meta)"
          required
        >
          <UInput
            :model-value="field.state.value"
            :readonly="!shortCodeEditable"
            maxlength="5"
            autocapitalize="characters"
            class="wm:w-28 wm:font-mono"
            data-testid="field-short_code"
            @update:model-value="
              (next: string | number) => field.handleChange(String(next).toUpperCase())
            "
            @blur="field.handleBlur"
          />
        </UFormField>
      </template>
    </form.Field>
    <form.Field name="color" :validators="validators('color')">
      <template #default="{ field }">
        <ColorField
          :model-value="field.state.value"
          :taken="taken"
          :error="errorOf('color', field.state.meta)"
          @update:model-value="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field
      v-for="key in textFields.slice(1)"
      :key="key"
      :name="key"
      :validators="validators(key)"
    >
      <template #default="{ field }">
        <UFormField
          :label="t.fields[key]"
          :name="field.name"
          :error="errorOf(key, field.state.meta)"
          required
        >
          <UInput
            :model-value="field.state.value"
            class="wm:w-full"
            :data-testid="`field-${key}`"
            @update:model-value="
              (next: string | number) => typed(key, field.handleChange, String(next))
            "
            @blur="field.handleBlur"
          />
        </UFormField>
        <div
          v-if="key === 'kind'"
          class="wm:mt-1.5 wm:flex wm:flex-wrap wm:items-center wm:gap-1.5"
          role="group"
          :aria-label="t.suggestions"
          data-testid="kind-suggestions"
        >
          <UButton
            v-for="pair in suggestions"
            :key="t.suggestion(pair)"
            type="button"
            size="xs"
            color="neutral"
            variant="soft"
            :label="t.suggestion(pair)"
            @click="choose(pair)"
          />
        </div>
      </template>
    </form.Field>
    <ConflictChoice v-if="conflicts" :conflicts="conflicts" :disabled="pending" @apply="resolve" />
    <ErrorNotice v-if="notice" :message="notice" :handlers="{ retry: submit }" />
    <div class="wm:flex wm:flex-wrap wm:justify-end wm:gap-2">
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        :label="t.form.cancel"
        @click="emit('cancel')"
      />
      <UButton
        type="submit"
        :label="t.form.save"
        :loading="pending"
        :disabled="pending || conflicts !== undefined"
        data-testid="community-save"
      />
    </div>
  </form>
</template>
