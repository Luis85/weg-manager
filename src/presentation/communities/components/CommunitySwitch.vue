<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UIcon from "@nuxt/ui/components/Icon.vue";
import { computed } from "vue";
import {
  communityList,
  communityListChanges,
  communitySelection,
  communitySelectionChanges,
  selectCommunity,
  shownName,
  type Community,
} from "../../../application/communities";
import { useCommand, useMessages, useStream } from "../../shell";
import CommunityBadge from "./CommunityBadge.vue";

/**
 * The community switch in the frame's context area (ADR 0008, PBI-56): one button per community
 * with its short code, colour and name; the selected one is pressed and carries a check mark, so
 * it does not rely on colour alone. A long name is cut off inside the column and shown in full as
 * the button's title. The selection is one for all open views and is kept per device. With two or
 * more and none selected, it asks for a choice.
 */
const t = useMessages().communities;
const list = useStream(communityList, communityListChanges);
const selection = useStream(communitySelection, communitySelectionChanges);
const select = useCommand(selectCommunity);

/** Each community that can be selected: one entry per id, in the list's order. */
const options = computed(() => {
  const seen = new Set<string>();
  const found: (Community & { readonly id: string })[] = [];
  for (const community of list.value.communities) {
    const { id } = community;
    if (id === undefined || seen.has(id)) continue;
    seen.add(id);
    found.push({ ...community, id });
  }
  return found;
});
const none = computed(() => selection.value.ready && options.value.length === 0);
</script>

<template>
  <div
    class="wm:flex wm:flex-col wm:gap-1"
    role="group"
    :aria-label="t.switcher.label"
    data-testid="community-switch"
  >
    <p class="wm:px-2 wm:text-xs wm:font-medium wm:uppercase wm:text-muted" aria-hidden="true">
      {{ t.switcher.label }}
    </p>
    <p v-if="none" class="wm:px-2 wm:text-sm wm:text-muted">{{ t.switcher.none }}</p>
    <ul class="wm:flex wm:min-w-0 wm:flex-row wm:flex-wrap wm:gap-1 wm:@min-[860px]:flex-col">
      <li v-for="option in options" :key="option.id" class="wm:min-w-0 wm:max-w-full">
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          active-color="primary"
          active-variant="soft"
          class="wm:w-full wm:min-w-0"
          :title="shownName(option)"
          :active="selection.id === option.id"
          :aria-pressed="selection.id === option.id"
          :disabled="select.pending.value"
          data-testid="community-option"
          @click="select.run(option.id)"
        >
          <CommunityBadge :short-code="option.values.short_code" :color="option.values.color" />
          <span
            class="wm:min-w-0 wm:flex-1 wm:truncate wm:text-start"
            data-testid="community-option-name"
            >{{ shownName(option) }}</span
          >
          <UIcon
            v-if="selection.id === option.id"
            name="i-lucide-check"
            class="wm:size-4 wm:shrink-0"
            aria-hidden="true"
            data-testid="community-option-check"
          />
        </UButton>
      </li>
    </ul>
    <p
      class="wm:px-2 wm:text-sm wm:font-medium wm:text-warning wm:empty:hidden"
      role="status"
      data-testid="community-choice"
    >
      <span v-if="selection.choiceNeeded">{{ t.switcher.choose }}</span>
    </p>
  </div>
</template>
