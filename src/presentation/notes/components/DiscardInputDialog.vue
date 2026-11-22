<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UModal from "@nuxt/ui/components/Modal.vue";
import { computed } from "vue";
import { useMessages } from "../../shell";

/**
 * Asks before a record's form closes with unsaved input (PBI-72), as `DeleteRecordDialog` asks
 * before a delete: a modal dialog named by its title, opened with the focus on "Weiter
 * bearbeiten", the safe choice, which Escape and a click outside choose too. `content` (the
 * screen's `useModal`) makes it modal and returns the focus to where it was when the user keeps
 * editing.
 */
const props = defineProps<{ open: boolean; content: Record<string, unknown> }>();
const emit = defineEmits<{ keep: []; discard: [] }>();

const t = useMessages().notes.discard;
const shown = computed({
  get: () => props.open,
  set: (next: boolean) => {
    if (!next) emit("keep");
  },
});
</script>

<template>
  <UModal v-model:open="shown" :title="t.title" :description="t.detail" :content="content">
    <template #footer>
      <div
        class="wm:flex wm:w-full wm:flex-wrap wm:justify-end wm:gap-2"
        data-testid="discard-dialog"
      >
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          :label="t.keep"
          data-autofocus
          @click="emit('keep')"
        />
        <UButton type="button" color="error" :label="t.confirm" @click="emit('discard')" />
      </div>
    </template>
  </UModal>
</template>
