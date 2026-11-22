<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UIcon from "@nuxt/ui/components/Icon.vue";
import { computed, nextTick, useTemplateRef } from "vue";
import { shownName, type Community } from "../../../application/communities";
import CommunityBadge from "./CommunityBadge.vue";

/**
 * The options of the community switch as one choice (`role="radiogroup"`, handoff
 * CommunityPicker), named by the switch's caption (`labelledby`). Each option shows short code,
 * colour and name; the checked one carries a check mark, so it does not rely on colour alone. The
 * arrow keys move the choice and the focus, Home and End go to the first and last; only the
 * checked option (or the first) is in the tab order. A long name is cut off and shown in full as
 * the option's title.
 */
const props = defineProps<{
  options: readonly (Community & { readonly id: string })[];
  selected: string | undefined;
  labelledby: string;
}>();
const emit = defineEmits<{ choose: [id: string] }>();

const group = useTemplateRef<HTMLElement>("group");
/** The option in the tab order: the checked one, else the first. */
const tabStop = computed(
  () => props.options.find((option) => option.id === props.selected)?.id ?? props.options[0]?.id,
);

const KEYS: Readonly<Record<string, (index: number, count: number) => number>> = {
  ArrowDown: (index, count) => (index + 1) % count,
  ArrowRight: (index, count) => (index + 1) % count,
  ArrowUp: (index, count) => (index - 1 + count) % count,
  ArrowLeft: (index, count) => (index - 1 + count) % count,
  Home: () => 0,
  End: (_, count) => count - 1,
};

/** Moves the choice as radio buttons do: focus and check the next option. */
const move = async (event: KeyboardEvent) => {
  const step = KEYS[event.key];
  if (step === undefined) return;
  event.preventDefault();
  const from = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-option-id]");
  const current = props.options.findIndex((option) => option.id === from?.dataset["optionId"]);
  const next = props.options[step(Math.max(current, 0), props.options.length)];
  if (next === undefined) return;
  emit("choose", next.id);
  await nextTick();
  group.value?.querySelector<HTMLElement>(`[data-option-id="${next.id}"]`)?.focus();
};
</script>

<template>
  <div
    ref="group"
    class="wm:flex wm:min-w-0 wm:flex-row wm:flex-wrap wm:gap-1 wm:@min-[860px]:flex-col"
    role="radiogroup"
    :aria-labelledby="labelledby"
    data-testid="community-options"
    @keydown="move"
  >
    <div v-for="option in options" :key="option.id" class="wm:min-w-0 wm:max-w-full">
      <UButton
        type="button"
        role="radio"
        color="neutral"
        variant="ghost"
        active-color="primary"
        active-variant="soft"
        class="wm:w-full wm:min-w-0"
        :title="shownName(option)"
        :active="selected === option.id"
        :aria-checked="selected === option.id ? 'true' : 'false'"
        :tabindex="tabStop === option.id ? 0 : -1"
        :data-option-id="option.id"
        data-testid="community-option"
        @click="emit('choose', option.id)"
      >
        <CommunityBadge :short-code="option.values.short_code" :color="option.values.color" />
        <span
          class="wm:min-w-0 wm:flex-1 wm:truncate wm:text-start"
          data-testid="community-option-name"
          >{{ shownName(option) }}</span
        >
        <UIcon
          v-if="selected === option.id"
          name="i-lucide-check"
          class="wm:size-4 wm:shrink-0"
          aria-hidden="true"
          data-testid="community-option-check"
        />
      </UButton>
    </div>
  </div>
</template>
