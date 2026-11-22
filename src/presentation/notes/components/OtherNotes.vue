<script setup lang="ts">
import {
  describeUnindexedIssue,
  unindexedChanges,
  unindexedSnapshot,
} from "../../../application/notes";
import { useMessages, useStream } from "../../shell";
import OpenNoteButton from "./OpenNoteButton.vue";

/**
 * The WEG Manager notes that are no record of a known type (VIEW-07): a `schema` that cannot be read or
 * names an unknown type anywhere in the vault, or unreadable properties in the plugin's folder,
 * each with its path, its issue and a way to open it in Obsidian to repair it by hand.
 */
const catalog = useMessages();
const unindexed = useStream(unindexedSnapshot, unindexedChanges);
</script>

<template>
  <section
    v-if="unindexed.notes.length > 0"
    class="wm:flex wm:flex-col wm:gap-2"
    data-testid="unindexed-notes"
  >
    <h3 class="wm:text-base wm:font-semibold">{{ catalog.notes.dataIssues.otherNotes }}</h3>
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
</template>
