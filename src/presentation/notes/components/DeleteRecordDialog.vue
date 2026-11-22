<script setup lang="ts" generic="R, E extends AppError">
import UButton from "@nuxt/ui/components/Button.vue";
import UModal from "@nuxt/ui/components/Modal.vue";
import { computed } from "vue";
import type { AppError } from "../../../application/errors";
import { ErrorNotice, useCommand, useMessages, type UseCaseFn } from "../../shell";

/**
 * Asks before a record's note goes to Obsidian's trash. `remove` is the feature's delete use case;
 * it runs as a command: it completes even if the view closes, and the dialog stays open with the
 * reason if it fails. The screen mounts one dialog per record (keyed), so a delete cancelled while
 * it runs ends as `useCommand` ends a run after its scope: silent on success, a notice on failure.
 * `title` is the feature's ("Gemeinschaft löschen"), `name` the record's shown name. The dialog
 * opens with the focus on "Abbrechen"; `content` (the screen's `useModal`) makes it modal and
 * decides where the focus goes after it. The confirmation never turns `disabled` under the focus:
 * while the delete runs it says `aria-disabled` and ignores a click.
 */
const props = defineProps<{
  record: R | undefined;
  title: string;
  name: string;
  remove: UseCaseFn<[R], unknown, E>;
  content: Record<string, unknown>;
}>();
const emit = defineEmits<{ close: []; deleted: [] }>();

const t = useMessages().notes.deletion;
// The use case of the dialog's first render: one dialog per record, and it does not change.
const run = useCommand(props.remove);
const open = computed({
  get: () => props.record !== undefined,
  set: (next: boolean) => {
    if (!next) emit("close");
  },
});

const confirm = async () => {
  if (props.record === undefined || run.pending.value) return;
  const outcome = await run.run(props.record);
  // Only a delete that happened closes the dialog: a failure stays as its alert, a defect as the
  // notice that reports it.
  if (outcome._tag === "success") {
    emit("deleted");
    emit("close");
  }
};
</script>

<template>
  <UModal v-model:open="open" :title="title" :description="t.detail(name)" :content="content">
    <template #body>
      <ErrorNotice v-if="run.message.value" :message="run.message.value" />
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
          :label="t.cancel"
          data-autofocus
          @click="emit('close')"
        />
        <UButton
          type="button"
          color="error"
          :label="t.confirm"
          :icon="run.pending.value ? 'i-lucide-loader-circle' : undefined"
          :ui="{ leadingIcon: run.pending.value ? 'wm:animate-spin' : '' }"
          :aria-disabled="run.pending.value ? 'true' : undefined"
          :aria-busy="run.pending.value ? 'true' : undefined"
          class="wm:aria-disabled:cursor-not-allowed wm:aria-disabled:opacity-75"
          data-testid="delete-confirm"
          @click="confirm"
        />
      </div>
    </template>
  </UModal>
</template>
