<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UIcon from "@nuxt/ui/components/Icon.vue";
import { computed, shallowRef } from "vue";
import { describeMatterIssue, shownName, type Matter } from "../../../application/matters";
import { UNKNOWN_SOURCE, checkMark, promiseAge, shownNumber } from "../../../domain/matters";
import { OpenNoteButton } from "../../notes";
import { useMessages } from "../../shell";
import MatterHistory from "./MatterHistory.vue";

/**
 * One matter in the list (VIEW-03): its number with the community's short code, the outcome, the
 * status and kind, the topic, the due date with the computed check mark in words, who is
 * responsible and the next step, a source gap, and its issues as text. An editable note offers
 * edit; a read-only one offers to open the note in Obsidian. Matters are never deleted.
 */
const props = defineProps<{
  matter: Matter;
  today: string;
  shortCodes: ReadonlyMap<string, string>;
  contactNames: ReadonlyMap<string, string>;
  /** The contacts a history entry may name as its actor. */
  contacts: readonly { readonly value: string; readonly label: string }[];
  /** Every matter, for a merge's candidates. */
  matters: readonly Matter[];
  /** The shown number of each matter by id ("AW 041"), for the lineage line. */
  numbers: ReadonlyMap<string, string>;
}>();
const emit = defineEmits<{ edit: [] }>();

const catalog = useMessages();
const t = catalog.matters;
const name = computed(() => shownName(props.matter));
const values = computed(() => props.matter.values);
const number = computed(() => {
  const { number: value, community_id: community } = values.value;
  return value === undefined
    ? "?"
    : shownNumber(community === undefined ? undefined : props.shortCodes.get(community), value);
});
const facts = computed(() => {
  const { status, kind, topic, follow_up_on: followUp } = values.value;
  return [
    status === undefined ? undefined : t.statuses[status],
    kind === undefined ? undefined : t.kinds[kind],
    topic,
    due.value,
    followUp === undefined ? undefined : t.screen.followUp(followUp),
  ]
    .filter((part) => part !== undefined)
    .join(" · ");
});
/** The due date with what it is and how far it is checked, and the promise's age (PBI-09). */
const due = computed(() => {
  const { due_on: day, due_kind: kind, due_checked: checked, promised_on: promised } = values.value;
  const detail = [
    kind === undefined ? undefined : t.dueKinds[kind],
    checked === undefined ? undefined : t.dueChecks[checked],
  ].filter((part) => part !== undefined);
  const date = day === undefined ? t.screen.noDue : t.screen.due(day);
  const age = promiseAge(promised, props.today);
  return [
    detail.length === 0 ? date : `${date} (${detail.join(", ")})`,
    age === undefined ? undefined : t.promisedAgo(age),
  ]
    .filter((part) => part !== undefined)
    .join(" · ");
});
const mark = computed(() => {
  const found = checkMark(values.value, props.today);
  return found === undefined ? undefined : t.checkMarks[found];
});
const lines = computed(() => {
  const { responsible_id: responsible, next_step: step } = values.value;
  return [
    responsible === undefined
      ? undefined
      : t.screen.responsible(props.contactNames.get(responsible) ?? responsible),
    step === undefined ? undefined : t.screen.nextStep(step),
  ].filter((line) => line !== undefined);
});
/** A matter's shown number by id, or the id when it is not listed. */
const numberOf = (id: string) => props.numbers.get(id) ?? id;
const listOf = (ids: readonly string[]) => ids.map(numberOf).join(", ");
/** Where the matter came from and what it became (PBI-06, PBI-07), by number. */
const lineage = computed(() => {
  const { split_from_id, split_into_ids, merged_into_id, merged_from_ids } = values.value;
  return [
    split_from_id === undefined ? undefined : t.lineage.splitFrom(numberOf(split_from_id)),
    split_into_ids === undefined ? undefined : t.lineage.splitInto(listOf(split_into_ids)),
    merged_into_id === undefined ? undefined : t.lineage.mergedInto(numberOf(merged_into_id)),
    merged_from_ids === undefined ? undefined : t.lineage.mergedFrom(listOf(merged_from_ids)),
  ]
    .filter((part) => part !== undefined)
    .join(" · ");
});
/** The small notes under the facts: the lineage, then the source gap. */
const hints = computed(() =>
  [
    { id: "matter-lineage", text: lineage.value },
    {
      id: "matter-source-gap",
      text: values.value.source === UNKNOWN_SOURCE ? t.screen.sourceGap : "",
    },
  ].filter((hint) => hint.text !== ""),
);
/** Whether the history shows under the card. */
const historyOpen = shallowRef(false);
const issues = computed(() =>
  props.matter.issues.map((issue) => describeMatterIssue(issue, catalog)),
);
</script>

<template>
  <li
    class="wm:flex wm:flex-wrap wm:items-start wm:gap-3 wm:rounded-md wm:border wm:border-default wm:p-3"
    data-testid="matter"
  >
    <span
      class="wm:rounded wm:border wm:border-default wm:px-1.5 wm:font-mono wm:text-sm"
      data-testid="matter-number"
    >
      {{ number }}
    </span>
    <div class="wm:flex wm:min-w-40 wm:flex-1 wm:flex-col wm:gap-1">
      <h3
        class="wm:text-base wm:font-semibold wm:wrap-break-word wm:hyphens-auto"
        tabindex="-1"
        data-focus="name"
        data-testid="matter-name"
      >
        {{ name }}
      </h3>
      <p class="wm:text-sm wm:text-muted wm:wrap-break-word" data-testid="matter-facts">
        {{ facts }}
      </p>
      <p
        v-if="mark"
        class="wm:flex wm:w-fit wm:items-center wm:gap-1 wm:text-sm wm:font-semibold wm:text-warning"
        data-testid="matter-check"
      >
        <UIcon name="i-lucide-triangle-alert" class="wm:size-3.5" aria-hidden="true" />
        {{ mark }}
      </p>
      <p v-for="line in lines" :key="line" class="wm:text-sm wm:wrap-break-word">{{ line }}</p>
      <p
        v-for="hint in hints"
        :key="hint.id"
        class="wm:text-xs wm:text-muted"
        :data-testid="hint.id"
      >
        {{ hint.text }}
      </p>
      <ul
        v-if="issues.length > 0"
        class="wm:flex wm:flex-col wm:gap-1 wm:text-sm wm:text-warning"
        data-testid="matter-issues"
      >
        <li v-for="issue in issues" :key="issue">{{ issue }}</li>
      </ul>
    </div>
    <OpenNoteButton v-if="!matter.editable" :path="matter.path" :name="name" />
    <UButton
      v-else
      type="button"
      size="sm"
      color="neutral"
      variant="outline"
      icon="i-lucide-pencil"
      :label="t.screen.edit"
      :aria-label="t.screen.editLabel(name)"
      data-focus="edit"
      data-testid="matter-edit"
      @click="emit('edit')"
    />
    <UButton
      type="button"
      size="sm"
      color="neutral"
      variant="ghost"
      icon="i-lucide-history"
      :label="historyOpen ? t.history.hide : t.history.show"
      :aria-label="t.history.showLabel(name)"
      :aria-expanded="historyOpen ? 'true' : 'false'"
      data-testid="matter-history-toggle"
      @click="historyOpen = !historyOpen"
    />
    <MatterHistory
      v-if="historyOpen"
      :matter="matter"
      :today="today"
      :contacts="contacts"
      :contact-names="contactNames"
      :matters="matters"
      :numbers="numbers"
    />
  </li>
</template>
