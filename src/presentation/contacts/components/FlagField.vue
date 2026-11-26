<script setup lang="ts">
import { useId } from "vue";

/**
 * One flag of the contact form as a native checkbox with its help text. A `locked` flag stays on:
 * it says `aria-disabled` and ignores a click, never `disabled`, so it keeps the focus.
 */
const props = defineProps<{
  label: string;
  checked: boolean;
  help: string;
  error: string | false;
  testId: string;
  locked?: boolean;
}>();
const emit = defineEmits<{ change: [checked: boolean] }>();
const helpId = useId();

const click = (event: MouseEvent) => {
  if (props.locked === true) event.preventDefault();
};
</script>

<template>
  <div class="wm:flex wm:flex-col wm:gap-1">
    <label class="wm:flex wm:items-center wm:gap-2 wm:text-sm">
      <input
        type="checkbox"
        :checked="checked || locked"
        :aria-disabled="locked ? 'true' : undefined"
        :aria-describedby="helpId"
        :data-testid="testId"
        @click="click"
        @change="(event) => emit('change', (event.target as HTMLInputElement).checked)"
      />
      {{ label }}
    </label>
    <p :id="helpId" class="wm:text-xs wm:text-muted">{{ help }}</p>
    <p v-if="error" class="wm:text-sm wm:text-error">{{ error }}</p>
  </div>
</template>
