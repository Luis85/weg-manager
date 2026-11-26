<script setup lang="ts">
/** One decision of the week (PBI-14): its matter and outcome, why it is put forward, its next step. */
defineProps<{
  title: string;
  reason: string;
  step: string | undefined;
  nextStep: (step: string) => string;
  urgent: boolean;
}>();
</script>

<template>
  <li
    class="wm:rounded-md wm:border wm:border-default wm:p-2 wm:text-sm"
    :data-testid="urgent ? 'decision-urgent' : 'decision'"
  >
    <p class="wm:font-medium">{{ title }}</p>
    <p class="wm:text-xs" :class="urgent ? 'wm:text-warning' : 'wm:text-muted'">{{ reason }}</p>
    <p v-if="step" class="wm:text-xs">{{ nextStep(step) }}</p>
  </li>
</template>
