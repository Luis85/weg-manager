<script setup lang="ts">
import UIcon from "@nuxt/ui/components/Icon.vue";
import { computed, useId } from "vue";
import {
  communityList,
  communityListChanges,
  communitySelection,
  communitySelectionChanges,
  selectCommunity,
  type Community,
} from "../../../application/communities";
import { selectableIds } from "../../../domain/communities";
import { useCommand, useDelayed, useMessages, useStream } from "../../shell";
import CommunityOptions from "./CommunityOptions.vue";

/**
 * The community switch in the frame's context area (ADR 0008, PBI-56): a caption and the
 * communities without issues as one choice (`CommunityOptions`). The selection is one for all open
 * views and is kept per device. With two or more and none selected, it asks for a choice with a
 * warning mark. Until the list is read it shows only its caption, then "Wird geladen …" once that
 * takes longer than 300 ms; after a failed first read it hides, and the screen says why. Without
 * communities, or when each has an issue, it says so instead of showing an empty group.
 */
const t = useMessages().communities;
const list = useStream(communityList, communityListChanges);
const selection = useStream(communitySelection, communitySelectionChanges);
const select = useCommand(selectCommunity);
const captionId = useId();

/** Each community that can be selected: one without issues, in the list's order. */
const options = computed(() => {
  const ids = new Set(selectableIds(list.value.records));
  return list.value.records.filter(
    (community): community is Community & { readonly id: string } =>
      community.id !== undefined && ids.delete(community.id),
  );
});
const ready = computed(() => selection.value.ready && list.value.ready);
const loading = useDelayed(() => !ready.value && list.value.failure === undefined);
/** What the switch shows below its caption. */
const state = computed(() => {
  if (!ready.value) return list.value.failure === undefined ? "loading" : "failed";
  if (options.value.length > 0) return "options";
  return list.value.records.length === 0 ? "none" : "unavailable";
});
const note = computed(() =>
  state.value === "none" || state.value === "unavailable" ? t.switcher[state.value] : undefined,
);

const choose = (id: string) => {
  if (!select.pending.value && id !== selection.value.id) void select.run(id);
};
</script>

<template>
  <div
    v-if="state !== 'failed'"
    class="wm:flex wm:flex-col wm:gap-1"
    data-testid="community-switch"
  >
    <p :id="captionId" class="wm:px-2 wm:text-xs wm:font-medium wm:uppercase wm:text-muted">
      {{ t.switcher.label }}
    </p>
    <p
      v-if="state === 'loading' && loading"
      class="wm:px-2 wm:text-sm wm:text-muted"
      role="status"
      data-testid="community-switch-loading"
    >
      {{ t.switcher.loading }}
    </p>
    <p v-if="note" class="wm:px-2 wm:text-sm wm:text-muted">{{ note }}</p>
    <CommunityOptions
      v-if="state === 'options'"
      :options="options"
      :selected="selection.id"
      :labelledby="captionId"
      @choose="choose"
    />
    <p
      class="wm:flex wm:items-center wm:gap-1 wm:px-2 wm:text-sm wm:font-medium wm:text-warning wm:empty:hidden"
      role="status"
      data-testid="community-choice"
    >
      <template v-if="selection.choiceNeeded">
        <UIcon name="i-lucide-triangle-alert" class="wm:size-4 wm:shrink-0" aria-hidden="true" />
        <span>{{ t.switcher.choose }}</span>
      </template>
    </p>
  </div>
</template>
