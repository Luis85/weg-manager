<script setup lang="ts">
import { computed } from "vue";
import type { Candidate, Selection, SelectionReason } from "../../../domain/week";
import DecisionCard from "./DecisionCard.vue";
import { useMessages } from "../../shell";

/**
 * The decisions of the week (PBI-14): the budget, the regular cards chosen over all communities
 * with their reason, the urgent ones on top of the budget, all shown, and the backlog folded away.
 * Each card names its matter, its outcome and its next step.
 */
const props = defineProps<{
  selection: Selection;
  labels: ReadonlyMap<string, string>;
  outcomes: ReadonlyMap<string, string>;
  steps: ReadonlyMap<string, string>;
}>();
const t = useMessages().week.decisions;

/** Why a candidate is put forward, in words, by its reason. */
const REASONS: Readonly<Record<SelectionReason, (candidate: Candidate) => string>> = {
  overdue: (candidate) => t.reasons.overdue(candidate.due ?? ""),
  "due-this-week": (candidate) => t.reasons["due-this-week"](candidate.due ?? ""),
  due: (candidate) => t.reasons.due(candidate.due ?? ""),
  age: (candidate) => t.reasons.age(candidate.age ?? 0),
  "age-unknown": () => t.reasons["age-unknown"](),
};
const cardsOf = (candidates: readonly Candidate[]) =>
  candidates.map((candidate) => ({
    id: candidate.id,
    title:
      `${props.labels.get(candidate.id) ?? ""} ${props.outcomes.get(candidate.id) ?? ""}`.trim(),
    reason: REASONS[candidate.reason](candidate),
    step: props.steps.get(candidate.id),
  }));
const groups = computed(() => ({
  urgent: cardsOf(props.selection.urgent),
  selected: cardsOf(props.selection.selected),
  backlog: cardsOf(props.selection.backlog),
}));
</script>

<template>
  <section class="wm:flex wm:flex-col wm:gap-2" :aria-label="t.title" data-testid="week-decisions">
    <div class="wm:flex wm:flex-wrap wm:items-baseline wm:justify-between wm:gap-2">
      <h3 class="wm:text-base wm:font-semibold">{{ t.title }}</h3>
      <span class="wm:text-sm" data-testid="decisions-budget">
        {{ t.budget(selection.selected.length, selection.budget) }}
      </span>
    </div>
    <p class="wm:text-xs wm:text-muted">{{ t.hint }} {{ t.focusPending }}</p>
    <p v-if="groups.selected.length === 0" class="wm:text-sm wm:text-muted">{{ t.none }}</p>
    <ol v-else class="wm:flex wm:flex-col wm:gap-2" data-testid="decisions-selected">
      <DecisionCard
        v-for="card in groups.selected"
        :key="card.id"
        v-bind="card"
        :next-step="t.nextStep"
        :urgent="false"
      />
    </ol>
    <template v-if="groups.urgent.length > 0">
      <h4 class="wm:text-sm wm:font-semibold wm:text-warning">{{ t.urgentTitle }}</h4>
      <p class="wm:text-xs wm:text-muted">{{ t.urgentHint }}</p>
      <ul class="wm:flex wm:flex-col wm:gap-2" data-testid="decisions-urgent">
        <DecisionCard
          v-for="card in groups.urgent"
          :key="card.id"
          v-bind="card"
          :next-step="t.nextStep"
          :urgent="true"
        />
      </ul>
    </template>
    <details v-if="groups.backlog.length > 0" data-testid="decisions-backlog">
      <summary class="wm:cursor-pointer wm:text-sm wm:font-semibold">
        {{ t.backlogTitle(groups.backlog.length) }}
      </summary>
      <ul class="wm:mt-2 wm:flex wm:flex-col wm:gap-1 wm:text-sm">
        <li v-for="card in groups.backlog" :key="card.id" data-testid="decision-backlog">
          {{ card.title }} <span class="wm:text-xs wm:text-muted">· {{ card.reason }}</span>
        </li>
      </ul>
    </details>
  </section>
</template>
