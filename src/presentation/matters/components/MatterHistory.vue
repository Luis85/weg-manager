<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { onMounted, shallowRef, watch } from "vue";
import type { Matter } from "../../../application/matters";
import { useHistoryList } from "../use-history";
import { useMessages } from "../../shell";
import DueChangeForm from "./DueChangeForm.vue";
import HistoryEntryForm from "./HistoryEntryForm.vue";
import HistoryList from "./HistoryList.vue";
import StatusChangeForm from "./StatusChangeForm.vue";

/**
 * A matter's history under its card (PBI-08, PBI-12): the entries, a form to add one and a form
 * to change the status with its reason, at most one form open. The history is read from the note
 * when it opens, after each write and whenever the note changes.
 */
const props = defineProps<{
  matter: Matter;
  today: string;
  contacts: readonly { readonly value: string; readonly label: string }[];
  contactNames: ReadonlyMap<string, string>;
}>();

const t = useMessages().matters.history;
const { history, reload, lines, corrected } = useHistoryList(() => props.matter);
const open = shallowRef<"entry" | "status" | "due" | undefined>();
onMounted(() => void reload());
watch(
  () => props.matter.frontmatter,
  () => void reload(),
);
const done = () => {
  open.value = undefined;
  void reload();
};
</script>

<template>
  <section
    class="wm:flex wm:w-full wm:flex-col wm:gap-2"
    :aria-label="t.title"
    data-testid="matter-history"
  >
    <h4 class="wm:text-sm wm:font-semibold">{{ t.title }}</h4>
    <p
      v-if="history.pending.value && lines.length === 0"
      role="status"
      class="wm:text-sm wm:text-muted"
    >
      {{ t.loading }}
    </p>
    <p v-else-if="lines.length === 0" class="wm:text-sm wm:text-muted" data-testid="history-empty">
      {{ t.empty }}
    </p>
    <HistoryList v-else :lines="lines" :corrected="corrected" :contact-names="contactNames" />
    <div v-if="open === undefined && matter.editable" class="wm:flex wm:flex-wrap wm:gap-2">
      <UButton
        type="button"
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-plus"
        :label="t.add"
        data-testid="history-add"
        @click="open = 'entry'"
      />
      <UButton
        type="button"
        size="sm"
        color="neutral"
        variant="outline"
        :label="t.change"
        data-testid="status-change"
        @click="open = 'status'"
      />
      <UButton
        type="button"
        size="sm"
        color="neutral"
        variant="outline"
        :label="t.changeDue"
        data-testid="due-change"
        @click="open = 'due'"
      />
    </div>
    <HistoryEntryForm
      v-if="open === 'entry'"
      :matter="matter"
      :lines="lines"
      :contacts="contacts"
      @done="done"
      @cancel="open = undefined"
    />
    <StatusChangeForm
      v-if="open === 'status'"
      :matter="matter"
      :today="today"
      @done="done"
      @cancel="open = undefined"
    />
    <DueChangeForm v-if="open === 'due'" :matter="matter" @done="done" @cancel="open = undefined" />
  </section>
</template>
