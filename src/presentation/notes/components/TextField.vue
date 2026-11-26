<script setup lang="ts">
import UFormField from "@nuxt/ui/components/FormField.vue";
import UInput from "@nuxt/ui/components/Input.vue";

/** One text field of a record form: label, input, optional help and its issue (`error`). */
defineProps<{
  label: string;
  value: string;
  error: string | false;
  testId: string;
  type?: "text" | "email" | "tel" | "date" | "number";
  help?: string | undefined;
  required?: boolean;
  /** The field that takes the focus when the sheet opens. */
  autofocus?: boolean;
}>();
const emit = defineEmits<{ change: [value: string]; blur: [] }>();
</script>

<template>
  <UFormField :label="label" :help="help ?? ''" :error="error">
    <UInput
      :model-value="value"
      :type="type ?? 'text'"
      class="wm:w-full"
      :aria-required="required ? 'true' : undefined"
      :data-autofocus="autofocus ? '' : undefined"
      :data-testid="testId"
      @update:model-value="(next: string | number) => emit('change', String(next))"
      @blur="emit('blur')"
    />
  </UFormField>
</template>
