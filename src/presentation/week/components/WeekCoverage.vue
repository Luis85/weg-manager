<script setup lang="ts">
import { computed } from "vue";
import type { Coverage } from "../../../domain/week";
import { useMessages } from "../../shell";

/**
 * What the briefing rests on (PBI-13 criterion 2, DF-08): when it was computed, the sources taken
 * into account, the unchecked ones and the known gaps; it never claims a complete inbox.
 */
const props = defineProps<{ coverage: Coverage; day: string; time: string }>();
const t = useMessages().week;
const gaps = computed(() => {
  const { unchecked, withoutSource, withoutDate } = props.coverage;
  const parts = [
    unchecked.length > 0 ? t.coverage.unchecked(unchecked.length) : undefined,
    withoutSource.length > 0 ? t.coverage.withoutSource(withoutSource.length) : undefined,
    withoutDate.length > 0 ? t.coverage.withoutDate(withoutDate.length) : undefined,
  ].filter((part) => part !== undefined);
  return parts.length === 0 ? t.coverage.noGaps : parts.join(" · ");
});
</script>

<template>
  <section
    class="wm:flex wm:flex-col wm:gap-1 wm:text-xs wm:text-muted"
    :aria-label="t.coverage.title"
    data-testid="week-coverage"
  >
    <p data-testid="week-computed">{{ t.screen.computed(day, time) }}</p>
    <p data-testid="week-sources">
      {{ t.coverage.sources(coverage.sources, coverage.sourcesThisWeek) }} · {{ gaps }}
    </p>
    <p>{{ t.coverage.scope }}</p>
  </section>
</template>
