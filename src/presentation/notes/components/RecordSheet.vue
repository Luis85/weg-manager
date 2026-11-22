<script setup lang="ts">
import USlideover from "@nuxt/ui/components/Slideover.vue";
import { computed } from "vue";
import type { RecordSheetState } from "../use-record-screen";
import DiscardInputDialog from "./DiscardInputDialog.vue";

/**
 * The sheet a record screen edits a record in (VIEW-07), with the question before unsaved input is
 * discarded (PBI-72): while the form in `body` holds unsaved input the sheet does not close by
 * itself, and Escape, a pointer-down outside and its close control ask first, as the form's cancel
 * does through the screen's `close`. `state` is the screen's (`useRecordScreen`).
 */
const props = defineProps<{ title: string; state: RecordSheetState }>();

const open = computed({
  get: () => props.state.sheetOpen.value,
  set: (next: boolean) => {
    if (!next) props.state.requestClose();
  },
});
</script>

<template>
  <USlideover
    v-model:open="open"
    :title="title"
    :content="state.sheet"
    :dismissible="state.sheetDismissible.value"
    :ui="{ body: 'wm:p-0 wm:sm:p-0' }"
    @close:prevent="state.requestClose"
  >
    <template #body>
      <slot name="body" />
    </template>
  </USlideover>
  <DiscardInputDialog
    :open="state.discarding.value"
    :content="state.discardDialog"
    @keep="state.keep"
    @discard="state.discard"
  />
</template>
