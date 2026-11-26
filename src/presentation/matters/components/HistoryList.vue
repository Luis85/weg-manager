<script setup lang="ts">
import { computed } from "vue";
import { BOARD_ACTOR, type HistoryLine } from "../../../domain/matters";
import { useMessages } from "../../shell";

/**
 * The entries of a matter's history in file order (PBI-12): the day it happened (or that it is
 * unknown), what happened, then kind, who, source and when it was recorded, so the event and its
 * recording stay apart. A corrected entry says so, and a correction names what it corrects; a line
 * the plugin cannot read is shown as written.
 */
const props = defineProps<{
  lines: readonly HistoryLine[];
  corrected: ReadonlySet<string>;
  contactNames: ReadonlyMap<string, string>;
}>();

const catalog = useMessages().matters;
const t = catalog.history;
/** The text of each entry by its id, for a correction's label. */
const texts = computed(
  () =>
    new Map(
      props.lines.flatMap((line) =>
        line.kind === "entry" ? [[line.entry.id, line.entry.text]] : [],
      ),
    ),
);
const textOf = (id: string) => texts.value.get(id) ?? id;
/** The earlier due date of a `new_date` entry, in words. */
const previousOf = (previous: string | undefined) => {
  if (previous === undefined) return undefined;
  return previous === "none" ? t.previousNone : t.previous(previous);
};
const shown = computed(() =>
  props.lines.map((line, at) => {
    if (line.kind === "unreadable") return { key: `u${at}`, unreadable: line.line };
    const { entry } = line;
    const actor =
      entry.actor === BOARD_ACTOR ? t.board : (props.contactNames.get(entry.actor) ?? entry.actor);
    return {
      key: entry.id,
      day: entry.occurred_on ?? t.unknownDay,
      text: entry.text,
      meta: t.meta(t.kinds[entry.kind], actor, entry.source, entry.recorded_on),
      status: entry.status === undefined ? undefined : t.statusTo(catalog.statuses[entry.status]),
      corrected: props.corrected.has(entry.id),
      correction: entry.corrects === undefined ? undefined : t.correction(textOf(entry.corrects)),
      previous: previousOf(entry.previous),
    };
  }),
);
</script>

<template>
  <ol class="wm:flex wm:flex-col wm:gap-2" data-testid="history">
    <li
      v-for="line in shown"
      :key="line.key"
      class="wm:border-l-2 wm:border-default wm:pl-2 wm:text-sm"
      data-testid="history-entry"
    >
      <p v-if="'unreadable' in line" class="wm:text-muted">
        <span class="wm:font-mono">{{ line.unreadable }}</span> — {{ t.unreadable }}
      </p>
      <template v-else>
        <p :class="line.corrected ? 'wm:line-through' : ''">
          <span class="wm:font-mono">{{ line.day }}</span> {{ line.text }}
          <span
            v-if="line.corrected"
            class="wm:no-underline wm:text-warning"
            data-testid="history-corrected"
          >
            ({{ t.corrected }})
          </span>
        </p>
        <p class="wm:text-xs wm:text-muted">{{ line.meta }}</p>
        <p v-if="line.status || line.correction || line.previous" class="wm:text-xs">
          {{ [line.status, line.previous, line.correction].filter(Boolean).join(" · ") }}
        </p>
      </template>
    </li>
  </ol>
</template>
