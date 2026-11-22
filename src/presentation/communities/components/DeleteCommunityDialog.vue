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
 * `useCommand` ends a run after its scope: silent on success, a notice on failure. The dialog
 * opens with the focus on "Abbrechen"; `content` (the screen's `useModal`) makes it modal and
 * decides where the focus goes after it. The confirmation never turns `disabled` under the
 * focus: while the delete runs it says `aria-disabled` and ignores a click.
 */
const props = defineProps<{
  community: Community | undefined;
  content: Record<string, unknown>;
}>();
const emit = defineEmits<{ close: []; deleted: [] }>();

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
  if (props.community === undefined || remove.pending.value) return;
  const outcome = await remove.run(props.community);
  // Only a delete that happened closes the dialog: a failure stays as its alert, a defect as the
  // notice that reports it.
  if (outcome._tag === "success") {
    emit("deleted");
    emit("close");
  }
};
</script>

<template>
  <UModal
    v-model:open="open"
    :title="t.deletion.title"
    :description="t.deletion.detail(name)"
    :content="content"
  >
    <template #body>
      <ErrorNotice v-if="remove.message.value" :message="remove.message.value" />
    </template>
    <template #footer>
      <div
        class="wm:flex wm:w-full wm:flex-wrap wm:justify-end wm:gap-2"
        data-testid="delete-dialog"
      >
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          :label="t.deletion.cancel"
          data-autofocus
          @click="emit('close')"
        />
        <UButton
          type="button"
          color="error"
          :label="t.deletion.confirm"
          :icon="remove.pending.value ? 'i-lucide-loader-circle' : undefined"
          :ui="{ leadingIcon: remove.pending.value ? 'wm:animate-spin' : '' }"
          :aria-disabled="remove.pending.value ? 'true' : undefined"
          :aria-busy="remove.pending.value ? 'true' : undefined"
          class="wm:aria-disabled:cursor-not-allowed wm:aria-disabled:opacity-75"
          data-testid="delete-confirm"
          @click="confirm"
        />
      </div>
    </template>
  </UModal>
</template>
