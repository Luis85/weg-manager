<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";

/**
 * The buttons at the bottom of a record form: cancel and save, in view at the bottom of the sheet,
 * also at 200 % zoom. Save is never `disabled` while it may hold the focus: while `blocked` it
 * says `aria-disabled` and the form's submit does nothing; while `pending` it shows a spinner.
 */
defineProps<{
  cancel: string;
  save: string;
  pending: boolean;
  blocked: boolean;
  /** The save button's test id, per record type (`community-save`). */
  saveId: string;
}>();
const emit = defineEmits<{ cancel: [] }>();
</script>

<template>
  <div
    class="wm:sticky wm:bottom-0 wm:flex wm:flex-wrap wm:justify-end wm:gap-2 wm:border-t wm:border-default wm:bg-default wm:px-4 wm:py-3 wm:sm:px-6"
    data-testid="form-footer"
  >
    <UButton
      type="button"
      color="neutral"
      variant="outline"
      :label="cancel"
      @click="emit('cancel')"
    />
    <UButton
      type="submit"
      :label="save"
      :icon="pending ? 'i-lucide-loader-circle' : undefined"
      :ui="{ leadingIcon: pending ? 'wm:animate-spin' : '' }"
      :aria-disabled="blocked ? 'true' : undefined"
      :aria-busy="pending ? 'true' : undefined"
      class="wm:aria-disabled:cursor-not-allowed wm:aria-disabled:opacity-75"
      :data-testid="saveId"
    />
  </div>
</template>
