<script setup lang="ts">
import USkeleton from "@nuxt/ui/components/Skeleton.vue";
import { computed } from "vue";
import {
  describeUnindexedIssue,
  rebuildNoteIndex,
  unindexedChanges,
  unindexedSnapshot,
} from "../../../application/notes";
import { describeError } from "../../../application/user-messages";
import { ErrorNotice, useCommand, useDelayed, useMessages, useStream } from "../../shell";
import OpenNoteButton from "./OpenNoteButton.vue";

/**
 * The settings section "Datenprobleme" (VIEW-07, glossary: data issues): the WEG Manager notes
 * that are no record of a known type: a `schema` that cannot be read or names an unknown type
 * anywhere in the vault, or unreadable properties in the plugin's folder, each with its path, its
 * issue and a way to open it in Obsidian to repair it by hand. Records with issues of their own
 * stay on their module's section, beside the valid ones. Loading shows after 300 ms; the index's
 * failure shows with a retry.
 */
const catalog = useMessages();
const t = catalog.notes.dataIssues;
const unindexed = useStream(unindexedSnapshot, unindexedChanges);
const rebuild = useCommand(() => rebuildNoteIndex);
const loading = computed(() => !unindexed.value.ready && unindexed.value.failure === undefined);
const loadingShown = useDelayed(() => loading.value);
const failure = computed(() =>
  unindexed.value.failure === undefined
    ? undefined
    : describeError(unindexed.value.failure, catalog),
);
const none = computed(() => unindexed.value.ready && unindexed.value.notes.length === 0);
</script>

<template>
  <div class="wm:flex wm:flex-col wm:gap-4" data-testid="data-issues-screen">
    <header class="wm:flex wm:flex-col wm:gap-1">
      <h2 class="wm:text-lg wm:font-semibold">{{ t.title }}</h2>
      <p class="wm:text-sm wm:text-muted wm:wrap-break-word">{{ t.intro }}</p>
    </header>
    <ErrorNotice
      v-if="failure"
      :message="failure"
      :handlers="{ retry: () => rebuild.run() }"
      data-testid="data-issues-failure"
    />
    <div
      v-if="loading && loadingShown"
      role="status"
      aria-busy="true"
      data-testid="data-issues-loading"
    >
      <USkeleton class="wm:h-16 wm:w-full" aria-hidden="true" />
      <span class="wm:sr-only">{{ t.loading }}</span>
    </div>
    <p v-if="none" class="wm:text-sm" data-testid="data-issues-none">{{ t.none }}</p>
    <section
      v-if="unindexed.notes.length > 0"
      class="wm:flex wm:flex-col wm:gap-2"
      data-testid="unindexed-notes"
    >
      <h3 class="wm:text-base wm:font-semibold">{{ t.otherNotes }}</h3>
      <ul class="wm:flex wm:flex-col wm:gap-2">
        <li
          v-for="note in unindexed.notes"
          :key="note.path"
          class="wm:flex wm:flex-col wm:gap-0.5 wm:rounded-md wm:border wm:border-default wm:p-3"
        >
          <span class="wm:font-mono wm:text-sm wm:wrap-anywhere">{{ note.path }}</span>
          <span class="wm:text-sm wm:text-warning">
            {{ describeUnindexedIssue(note.issue, catalog.notes) }}
          </span>
          <OpenNoteButton :path="note.path" :name="note.path" class="wm:mt-1" />
        </li>
      </ul>
    </section>
  </div>
</template>
