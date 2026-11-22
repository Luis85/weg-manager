<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import type { FrameEntry, ViewHistory } from "../navigation";
import { useMessages } from "../runtime/use-runtime";

/**
 * The app frame of one surface (ADR 0008): the view's back and forward controls, the context area
 * (the `context` slot) and the navigation, and the route outlet (the default slot). It follows the
 * width of its container, not the window, because an Obsidian pane can be narrow on a wide screen
 * (handoff 07): from 860 px the navigation is a sidebar, below it a row above the content. The
 * current page has a bar on its start edge besides its colour. The frame states the UI language
 * (`lang`), so the browser hyphenates and reads its texts in it.
 *
 * The history controls show once the view has a step to go back or forward to. One with nowhere
 * to go is `aria-disabled` and ignores a click, never `disabled`: a focused control that turns
 * `disabled` drops the focus to the page. While a sheet or dialog is open the frame is `inert`.
 */
const props = defineProps<{
  entries: readonly FrameEntry[];
  history: ViewHistory;
  inert?: boolean;
}>();

const { frame, language } = useMessages().shell;
const back = () => {
  if (props.history.canGoBack.value) props.history.back();
};
const forward = () => {
  if (props.history.canGoForward.value) props.history.forward();
};
</script>

<template>
  <div
    class="wm:@container wm:h-full"
    :lang="language"
    :inert="inert || undefined"
    data-testid="app-frame"
  >
    <div class="wm:flex wm:h-full wm:flex-col wm:@min-[860px]:flex-row">
      <nav
        :aria-label="frame.navigation"
        data-testid="frame-navigation"
        class="wm:flex wm:shrink-0 wm:flex-col wm:gap-2 wm:border-b wm:border-default wm:p-2 wm:@min-[860px]:w-56 wm:@min-[860px]:border-e wm:@min-[860px]:border-b-0"
      >
        <div
          v-if="history.canGoBack.value || history.canGoForward.value"
          class="wm:flex wm:gap-1"
          data-testid="frame-history"
        >
          <UButton
            type="button"
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            square
            class="wm:aria-disabled:cursor-not-allowed wm:aria-disabled:opacity-50"
            :aria-label="frame.back"
            :aria-disabled="history.canGoBack.value ? undefined : 'true'"
            @click="back"
          />
          <UButton
            type="button"
            icon="i-lucide-arrow-right"
            color="neutral"
            variant="ghost"
            square
            class="wm:aria-disabled:cursor-not-allowed wm:aria-disabled:opacity-50"
            :aria-label="frame.forward"
            :aria-disabled="history.canGoForward.value ? undefined : 'true'"
            @click="forward"
          />
        </div>
        <div v-if="$slots.context" class="wm:min-w-0" data-testid="frame-context">
          <slot name="context" />
        </div>
        <ul class="wm:flex wm:flex-row wm:flex-wrap wm:gap-1 wm:@min-[860px]:flex-col">
          <li v-for="entry in entries" :key="entry.label">
            <UButton
              type="button"
              :label="entry.label"
              :icon="entry.icon"
              color="neutral"
              variant="ghost"
              active-color="primary"
              active-variant="soft"
              :active="entry.current"
              :aria-current="entry.current ? 'page' : undefined"
              :class="['wm:w-full', entry.current && 'wm:shadow-[inset_3px_0_0_currentColor]']"
              @click="entry.select()"
            />
          </li>
        </ul>
      </nav>
      <section :aria-label="frame.content" class="wm:min-w-0 wm:flex-1 wm:overflow-auto">
        <slot />
      </section>
    </div>
  </div>
</template>
