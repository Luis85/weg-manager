<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UIcon from "@nuxt/ui/components/Icon.vue";
import { computed } from "vue";
import { describeMatterIssue, shownName, type Matter } from "../../../application/matters";
import { UNKNOWN_SOURCE, checkMark, shownNumber } from "../../../domain/matters";
import { OpenNoteButton } from "../../notes";
import { useMessages } from "../../shell";

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
  const { status, kind, topic, due_on: due, follow_up_on: followUp } = values.value;
  return [
    status === undefined ? undefined : t.statuses[status],
    kind === undefined ? undefined : t.kinds[kind],
    topic,
    due === undefined ? t.screen.noDue : t.screen.due(due),
    followUp === undefined ? undefined : t.screen.followUp(followUp),
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
const gap = computed(() => values.value.source === UNKNOWN_SOURCE);
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
      <p v-if="gap" class="wm:text-xs wm:text-muted" data-testid="matter-source-gap">
        {{ t.screen.sourceGap }}
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
  </li>
</template>
