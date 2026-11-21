<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import type { FrameEntry } from "../navigation";
import { useMessages } from "../runtime/use-runtime";

/**
 * The app frame of one surface (ADR 0008): the navigation with the context area on top of it (the
 * `context` slot), and the route outlet (the default slot). It follows the width of its container,
 * not the window, because an Obsidian pane can be narrow on a wide screen (handoff 07): from
 * 860 px the navigation is a sidebar, below it a row above the content.
 */
defineProps<{ entries: readonly FrameEntry[] }>();

const { frame } = useMessages().shell;
</script>

<template>
  <div class="wm:@container wm:h-full" data-testid="app-frame">
    <div class="wm:flex wm:h-full wm:flex-col wm:@min-[860px]:flex-row">
      <nav
        :aria-label="frame.navigation"
        class="wm:flex wm:shrink-0 wm:flex-col wm:gap-2 wm:border-b wm:border-default wm:p-2 wm:@min-[860px]:w-56 wm:@min-[860px]:border-e wm:@min-[860px]:border-b-0"
      >
        <div v-if="$slots.context" data-testid="frame-context">
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
              class="wm:w-full"
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
