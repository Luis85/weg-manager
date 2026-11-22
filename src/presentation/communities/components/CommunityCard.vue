<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UIcon from "@nuxt/ui/components/Icon.vue";
import { computed } from "vue";
import {
  describeCommunityIssue,
  shownName,
  type Community,
} from "../../../application/communities";
import { useMessages } from "../../shell";
import CommunityBadge from "./CommunityBadge.vue";
import OpenNoteButton from "./OpenNoteButton.vue";

/**
 * One community in the list (VIEW-07): badge, name, kind and unit label, and its issues as text. An
 * editable note offers edit and delete; a read-only one says so and offers to open the note in
 * Obsidian, where the user can repair it. The selected community (glossary: community selection)
 * says "Aktuell" in words and with a mark, not by colour. A long name wraps, hyphenated in the
 * frame's language, and breaks inside a word only when nothing else fits. The name heading can
 * take the focus (`tabindex="-1"`), for the screen to land on a card without an edit button.
 */
const props = defineProps<{ community: Community; selected: boolean }>();
const emit = defineEmits<{ edit: []; remove: [] }>();

const catalog = useMessages();
const t = catalog.communities;
const name = computed(() => shownName(props.community));
const summary = computed(() => {
  const { kind, unit_label } = props.community.values;
  return kind === undefined || unit_label === undefined
    ? undefined
    : t.screen.summary(kind, unit_label);
});
const issues = computed(() =>
  props.community.issues.map((issue) => describeCommunityIssue(issue, catalog)),
);
</script>

<template>
  <li
    class="wm:flex wm:flex-wrap wm:items-start wm:gap-3 wm:rounded-md wm:border wm:border-default wm:p-3"
    data-testid="community"
  >
    <CommunityBadge :short-code="community.values.short_code" :color="community.values.color" />
    <div class="wm:flex wm:min-w-40 wm:flex-1 wm:flex-col wm:gap-1">
      <h3
        class="wm:text-base wm:font-semibold wm:wrap-break-word wm:hyphens-auto"
        tabindex="-1"
        data-testid="community-name"
      >
        {{ name }}
      </h3>
      <p
        v-if="selected"
        class="wm:flex wm:w-fit wm:items-center wm:gap-1 wm:rounded wm:border wm:border-primary wm:px-1.5 wm:text-xs wm:font-semibold wm:text-primary"
        data-testid="community-selected"
      >
        <UIcon name="i-lucide-circle-check" class="wm:size-3.5" aria-hidden="true" />
        {{ t.screen.selected }}
      </p>
      <p
        v-if="summary"
        class="wm:text-sm wm:text-muted wm:wrap-break-word wm:hyphens-auto"
        data-testid="community-summary"
      >
        {{ summary }}
      </p>
      <p
        v-if="!community.editable"
        class="wm:flex wm:items-center wm:gap-1 wm:text-sm wm:text-muted"
        data-testid="community-read-only"
      >
        <UIcon name="i-lucide-lock" class="wm:size-4" aria-hidden="true" />
        {{ t.screen.readOnly }}
      </p>
      <ul
        v-if="issues.length > 0"
        class="wm:flex wm:flex-col wm:gap-1 wm:text-sm wm:text-warning"
        data-testid="community-issues"
      >
        <li v-for="issue in issues" :key="issue">{{ issue }}</li>
      </ul>
    </div>
    <OpenNoteButton v-if="!community.editable" :path="community.path" :name="name" />
    <div v-if="community.editable" class="wm:flex wm:gap-2">
      <UButton
        type="button"
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-pencil"
        :label="t.screen.edit"
        :aria-label="t.screen.editLabel(name)"
        data-testid="community-edit"
        @click="emit('edit')"
      />
      <UButton
        type="button"
        size="sm"
        color="error"
        variant="ghost"
        icon="i-lucide-trash-2"
        :label="t.screen.remove"
        :aria-label="t.screen.removeLabel(name)"
        data-testid="community-remove"
        @click="emit('remove')"
      />
    </div>
  </li>
</template>
