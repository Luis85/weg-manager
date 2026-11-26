<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { computed, onMounted, shallowRef, watch } from "vue";
import type { Matter } from "../../../application/matters";
import { useHistoryList } from "../use-history";
import { useMessages } from "../../shell";
import DueChangeForm from "./DueChangeForm.vue";
import HistoryEntryForm from "./HistoryEntryForm.vue";
import HistoryList from "./HistoryList.vue";
import MatterSources from "./MatterSources.vue";
import MatterTodos from "./MatterTodos.vue";
import MergeForm from "./MergeForm.vue";
import SourceForm from "./SourceForm.vue";
import SplitForm from "./SplitForm.vue";
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
  matters: readonly Matter[];
  numbers: ReadonlyMap<string, string>;
}>();

const catalog = useMessages().matters;
const t = catalog.history;
const sources = catalog.sources;
const { history, reload, lines, corrected } = useHistoryList(() => props.matter);
const open = shallowRef<Form | undefined>();
onMounted(() => void reload());
watch(
  () => props.matter.frontmatter,
  () => void reload(),
);
type Form = "entry" | "status" | "due" | "source" | "split" | "merge";
/** Whether the matter is closed by a split or a merge: it is then only history. */
const closed = () =>
  props.matter.values.split_into_ids !== undefined ||
  props.matter.values.merged_into_id !== undefined;
/** The buttons that open a form; a split or merged matter is not split or merged again. */
const actions = computed(() => {
  const all: { form: Form; id: string; label: string; icon?: string }[] = [
    { form: "entry", id: "history-add", label: t.add, icon: "i-lucide-plus" },
    { form: "status", id: "status-change", label: t.change },
    { form: "due", id: "due-change", label: t.changeDue },
    { form: "source", id: "source-add", label: sources.add, icon: "i-lucide-paperclip" },
    { form: "split", id: "split-start", label: t.split },
    { form: "merge", id: "merge-start", label: t.merge },
  ];
  return closed()
    ? all.filter((action) => action.form !== "split" && action.form !== "merge")
    : all;
});
/** The open form and its props, or `undefined` while none is open. */
const opened = computed(() => {
  const { matter, today, contacts, matters, numbers } = props;
  const forms = {
    entry: { component: HistoryEntryForm, props: { matter, lines: lines.value, contacts } },
    status: { component: StatusChangeForm, props: { matter, today } },
    due: { component: DueChangeForm, props: { matter } },
    source: { component: SourceForm, props: { matter, today } },
    split: { component: SplitForm, props: { matter, contacts } },
    merge: { component: MergeForm, props: { matter, matters, numbers } },
  } as const;
  return open.value === undefined ? undefined : forms[open.value];
});
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
    <HistoryList
      v-else
      :lines="lines"
      :corrected="corrected"
      :contact-names="contactNames"
      :numbers="numbers"
    />
    <MatterTodos :matter="matter" />
    <MatterSources :matter="matter" />
    <div v-if="open === undefined && matter.editable" class="wm:flex wm:flex-wrap wm:gap-2">
      <UButton
        v-for="action in actions"
        :key="action.form"
        type="button"
        size="sm"
        color="neutral"
        variant="outline"
        :icon="action.icon"
        :label="action.label"
        :data-testid="action.id"
        @click="open = action.form"
      />
    </div>
    <component
      :is="opened.component"
      v-if="opened !== undefined"
      v-bind="opened.props"
      @done="done"
      @cancel="open = undefined"
    />
  </section>
</template>
