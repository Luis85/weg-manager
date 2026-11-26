<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import type { UserMessage } from "../../../application/shell";
import { ErrorNotice } from "../../shell";

/**
 * The end of a form in a matter's history panel: what the use case said when it failed, then
 * cancel and the form's action.
 */
defineProps<{
  message: UserMessage | undefined;
  cancel: string;
  apply: string;
  applyId: string;
}>();
const emit = defineEmits<{ cancel: [] }>();
</script>

<template>
  <ErrorNotice v-if="message" :message="message" />
  <div class="wm:flex wm:justify-end wm:gap-2">
    <UButton
      type="button"
      color="neutral"
      variant="outline"
      :label="cancel"
      @click="emit('cancel')"
    />
    <UButton type="submit" :label="apply" :data-testid="applyId" />
  </div>
</template>
