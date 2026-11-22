<script setup lang="ts">
import { computed } from "vue";
import { unindexedChanges, unindexedSnapshot } from "../../../application/notes";
import { useMessages, useStream } from "../../shell";

/**
 * The count beside "Datenprobleme" in the settings navigation (VIEW-07: "mit Badge"): how many
 * notes the section lists, so a problem is seen from every section. Nothing while there are none.
 * The number is for the eye; a screen reader hears it as words in the entry's name.
 */
const t = useMessages().notes.dataIssues;
const unindexed = useStream(unindexedSnapshot, unindexedChanges);
const count = computed(() => unindexed.value.notes.length);
</script>

<template>
  <span
    v-if="count > 0"
    class="wm:rounded-full wm:border wm:border-warning wm:px-1.5 wm:text-xs wm:font-semibold wm:text-warning"
    data-testid="data-issues-count"
  >
    <span aria-hidden="true">{{ count }}</span>
    <span class="wm:sr-only">{{ t.count(count) }}</span>
  </span>
</template>
