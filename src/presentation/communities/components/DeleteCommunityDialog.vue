<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UModal from "@nuxt/ui/components/Modal.vue";
import { computed } from "vue";
import { deleteCommunity, shownName, type Community } from "../../../application/communities";
import { ErrorNotice, useCommand, useMessages } from "../../shell";

/**
 * Asks before a community's note goes to Obsidian's trash (PBI-56). The delete runs as a command:
 * it completes even if the view closes, and the dialog stays open with the reason if it fails.
 * The screen mounts one dialog per community, so a delete cancelled while it runs ends as
 * `useCommand` ends a run after its scope: silent on success, a notice on failure.
 */
const props = defineProps<{ community: Community | undefined }>();
const emit = defineEmits<{ close: [] }>();

const t = useMessages().communities;
const remove = useCommand(deleteCommunity);
const open = computed({
  get: () => props.community !== undefined,
  set: (next: boolean) => {
    if (!next) emit("close");
  },
});
const name = computed(() => (props.community === undefined ? "" : shownName(props.community)));

const confirm = async () => {
  if (props.community === undefined) return;
  await remove.run(props.community);
  if (remove.error.value === undefined && remove.message.value === undefined) emit("close");
};
</script>

<template>
  <UModal v-model:open="open" :title="t.deletion.title" :description="t.deletion.detail(name)">
    <template #body>
      <ErrorNotice v-if="remove.message.value" :message="remove.message.value" />
    </template>
    <template #footer>
      <div class="wm:flex wm:w-full wm:justify-end wm:gap-2" data-testid="delete-dialog">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          :label="t.deletion.cancel"
          @click="emit('close')"
        />
        <UButton
          type="button"
          color="error"
          :label="t.deletion.confirm"
          :loading="remove.pending.value"
          :disabled="remove.pending.value"
          data-testid="delete-confirm"
          @click="confirm"
        />
      </div>
    </template>
  </UModal>
</template>
