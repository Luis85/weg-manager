<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UFormField from "@nuxt/ui/components/FormField.vue";
import UInput from "@nuxt/ui/components/Input.vue";
import { useForm } from "@tanstack/vue-form";
import { computed, watch } from "vue";
import {
  ReadOnlySettingsError,
  describeIssues,
  greetingOf,
  updateGreeting,
} from "../../../application/shell";
import { describeError } from "../../../application/user-messages";
import { validatePatch } from "../../../domain/shell";
import ErrorNotice from "./ErrorNotice.vue";
import { useCommand, useMessages, useSettings, useSettingsStatus } from "../runtime/use-runtime";

/** The greeting form: domain rules validate on change, the service has the final word. */
const settings = useSettings();
const status = useSettingsStatus();
const catalog = useMessages();
const messages = catalog.shell;
const readOnly = computed(() => !status.value.writable);
/** Why the settings are read-only and what to do, from the shared message catalog. */
const readOnlyMessage = computed(() => {
  const reason = status.value.readOnlyReason;
  return reason === undefined
    ? undefined
    : describeError(new ReadOnlySettingsError({ reason }), catalog);
});
/** A save runs to its end even when the view closes meanwhile; a failure then becomes a notice. */
const save = useCommand(updateGreeting);
/** The greeting as the view shows it: the stored one or the default of the UI language. */
const shown = computed(() => greetingOf(settings.value, messages));

const greetingIssue = (greeting: string): string | undefined => {
  const result = validatePatch(settings.value, { greeting });
  return result.ok ? undefined : describeIssues(result.issues.slice(0, 1), messages);
};

const form = useForm({
  defaultValues: { greeting: shown.value },
  onSubmit: async ({ value }) => {
    await save.run(value.greeting);
    const error = save.error.value;
    if (error?._tag !== "InvalidSettingsError") return;
    form.setFieldMeta("greeting", (meta) => ({
      ...meta,
      errorMap: { ...meta.errorMap, onSubmit: describeIssues(error.issues, messages) },
    }));
  },
});

/**
 * One setting, one place (PBI-49): while the field still shows the previous value, it follows the
 * setting, e.g. after Sync changed `data.json`. What the user is typing is never replaced.
 */
watch(shown, (next, previous) => {
  if (form.getFieldValue("greeting") === previous) form.reset({ greeting: next });
});

const canSubmit = form.useSelector((state) => state.canSubmit);
const isSubmitting = form.useSelector((state) => state.isSubmitting);
const disabled = computed(() => readOnly.value || !canSubmit.value || isSubmitting.value);
/** Field-level problems are shown under the field; anything else (storage) as a notice. */
const notice = computed(() =>
  save.error.value?._tag === "InvalidSettingsError" ? undefined : save.message.value,
);

const firstError = (errors: readonly unknown[]): string | false => {
  const first = errors.find((error) => typeof error === "string" && error !== "");
  return typeof first === "string" ? first : false;
};

const submit = () => form.handleSubmit();
</script>

<template>
  <form class="wm:flex wm:flex-col wm:gap-3" novalidate @submit.prevent="submit">
    <form.Field name="greeting" :validators="{ onChange: ({ value }) => greetingIssue(value) }">
      <template #default="{ field }">
        <UFormField
          :label="messages.greetingForm.label"
          :name="field.name"
          :error="firstError(field.state.meta.errors)"
        >
          <UInput
            :model-value="field.state.value"
            :disabled="readOnly"
            data-testid="greeting-input"
            @update:model-value="(next: string | number) => field.handleChange(String(next))"
            @blur="field.handleBlur"
          />
        </UFormField>
      </template>
    </form.Field>
    <ErrorNotice v-if="readOnlyMessage" :message="readOnlyMessage" data-testid="read-only-hint" />
    <ErrorNotice v-if="notice" :message="notice" :handlers="{ retry: submit }" />
    <div>
      <UButton
        type="submit"
        :label="messages.greetingForm.save"
        :loading="isSubmitting"
        :disabled="disabled"
      />
    </div>
  </form>
</template>
