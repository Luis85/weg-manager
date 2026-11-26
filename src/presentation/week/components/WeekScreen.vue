<script setup lang="ts">
import { useWeek } from "../use-week";
import WeekBriefing from "./WeekBriefing.vue";
import WeekCoverage from "./WeekCoverage.vue";
import WeekDecisions from "./WeekDecisions.vue";
import WeekLists from "./WeekLists.vue";

/**
 * The week screen (VIEW-02, route `week`, PBI-13): the briefing of the week, the deadlines of the
 * next 14 days, the own to-dos and what it all rests on. Computed on opening, from the records the
 * index holds; the week starts on the day the settings tab names.
 */
const week = useWeek();
const { t, briefing, selection, steps, labels, outcomes } = week;
const { sentenceText, computedText, note, savedText, reload } = week;
</script>

<template>
  <div class="wm:flex wm:flex-col wm:gap-4" data-testid="week-screen">
    <header class="wm:flex wm:flex-col wm:gap-1">
      <h2 class="wm:text-lg wm:font-semibold" data-testid="week-title">
        {{ t.screen.title(briefing.coverage.weekOf) }}
      </h2>
      <p class="wm:text-sm wm:text-muted">{{ t.screen.intro }}</p>
      <p class="wm:text-xs wm:text-muted" data-testid="week-target">
        {{ t.screen.timeTarget(week.settings.value.weekMinutes) }}
      </p>
    </header>
    <WeekCoverage :coverage="briefing.coverage" :day="week.day.value" :time="week.openedAt" />
    <WeekBriefing
      :sentences="briefing.sentences"
      :sentence-text="sentenceText"
      :computed-text="computedText"
      :saved-text="savedText"
      :week-of="briefing.coverage.weekOf"
      :week="note"
      @saved="reload"
    />
    <WeekDecisions :selection="selection" :labels="labels" :outcomes="outcomes" :steps="steps" />
    <WeekLists :briefing="briefing" :labels="labels" :outcomes="outcomes" />
  </div>
</template>
