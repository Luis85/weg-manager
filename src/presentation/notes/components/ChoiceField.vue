<script setup lang="ts">
import { useId } from "vue";

/**
 * One choice of a record form as a native `select` (Obsidian styles it, every screen reader
 * knows it): label, options and its issue (`error`), which the select names.
 */
defineProps<{
  label: string;
  value: string;
  options: readonly { readonly value: string; readonly label: string }[];
  error: string | false;
  testId: string;
}>();
const emit = defineEmits<{ change: [value: string]; blur: [] }>();
const id = useId();
const errorId = useId();
</script>

<template>
  <div class="wm:flex wm:flex-col wm:gap-1">
    <label :for="id" class="wm:text-sm wm:font-medium">{{ label }}</label>
    <select
      :id="id"
      class="dropdown wm:w-full"
      :value="value"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
      :data-testid="testId"
      @change="(event) => emit('change', (event.target as HTMLSelectElement).value)"
      @blur="emit('blur')"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" :id="errorId" class="wm:text-sm wm:text-error">{{ error }}</p>
  </div>
</template>
