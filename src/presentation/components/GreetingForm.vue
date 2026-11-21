<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UFormField from "@nuxt/ui/components/FormField.vue";
import UInput from "@nuxt/ui/components/Input.vue";
import { useForm } from "@tanstack/vue-form";
import { computed } from "vue";
import { updateGreeting } from "../../application/use-cases";
import { validatePatch } from "../../domain/settings";
import ErrorNotice from "./ErrorNotice.vue";
import { useEffectAction, useSettings, useSettingsStatus } from "../runtime/use-runtime";

/** The greeting form: domain rules validate on change, the service has the final word. */
const settings = useSettings();
const readOnly = !useSettingsStatus().writable;
const save = useEffectAction(updateGreeting);

const greetingIssue = (greeting: string): string | undefined => {
  const result = validatePatch(settings.value, { greeting });
  return result.ok ? undefined : result.issues[0];
};

const form = useForm({
  defaultValues: { greeting: settings.value.greeting },
  onSubmit: async ({ value }) => {
    await save.run(value.greeting);
    const error = save.error.value;
    if (error?._tag !== "InvalidSettingsError") return;
    form.setFieldMeta("greeting", (meta) => ({
      ...meta,
      errorMap: { ...meta.errorMap, onSubmit: error.issues.join(" ") },
    }));
  },
});

const canSubmit = form.useSelector((state) => state.canSubmit);
const isSubmitting = form.useSelector((state) => state.isSubmitting);
const disabled = computed(() => readOnly || !canSubmit.value || isSubmitting.value);
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
          label="Begrüßung"
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
    <p v-if="readOnly" class="wm:text-sm wm:text-muted" data-testid="read-only-hint">
      Die Einstellungen sind schreibgeschützt und können hier nicht geändert werden.
    </p>
    <ErrorNotice v-if="notice" :message="notice" :handlers="{ retry: submit }" />
    <div>
      <UButton type="submit" label="Speichern" :loading="isSubmitting" :disabled="disabled" />
    </div>
  </form>
</template>
