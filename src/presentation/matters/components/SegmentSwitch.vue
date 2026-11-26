<script setup lang="ts" generic="V extends string">
import UButton from "@nuxt/ui/components/Button.vue";

/** A row of buttons that picks one part of a screen; the current one is pressed. */
defineProps<{
  segments: readonly { readonly value: V; readonly label: string }[];
  current: V;
  label: string;
}>();
const emit = defineEmits<{ change: [value: V] }>();
</script>

<template>
  <div role="group" :aria-label="label" class="wm:flex wm:gap-1" data-testid="segments">
    <UButton
      v-for="segment in segments"
      :key="segment.value"
      type="button"
      size="sm"
      color="neutral"
      :variant="segment.value === current ? 'solid' : 'outline'"
      :label="segment.label"
      :aria-pressed="segment.value === current ? 'true' : 'false'"
      :data-testid="`segment-${segment.value}`"
      @click="emit('change', segment.value)"
    />
  </div>
</template>
