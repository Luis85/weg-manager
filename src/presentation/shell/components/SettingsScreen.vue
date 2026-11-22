<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { computed } from "vue";
import { SETTINGS } from "../../../application/shell";
import { useRouting } from "../navigation";
import { useMessages } from "../runtime/use-runtime";
import NotFoundState from "./NotFoundState.vue";

/**
 * The settings screen (VIEW-07, `einstellungen/<bereich>`; ADR 0008, amendment 22.11.2026): the
 * shell owns it, the modules contribute its sections through the surface definition. A labelled
 * navigation leads to each section, the current one marked `aria-current="page"` and by a bar
 * beside its colour; each entry is a button in the tab order, and the row wraps in a narrow pane.
 * With a single section there is nothing to choose, so the navigation is left out. The screen
 * stays mounted across its sections (`RouteOutlet`), so the chosen entry keeps the focus; the
 * section remounts. A section no module contributes shows not-found.
 */
const catalog = useMessages();
const routing = useRouting();
const current = computed(() => (routing.route.value as { readonly section?: unknown }).section);
const shown = computed(() => routing.sections.find((section) => section.id === current.value));
const open = (id: string) => routing.navigate({ name: SETTINGS, section: id } as never);
</script>

<template>
  <div class="wm:m-3 wm:flex wm:flex-col wm:gap-4" data-testid="settings-screen">
    <nav
      v-if="routing.sections.length > 1"
      :aria-label="catalog.shell.frame.settingsSections"
      class="wm:border-b wm:border-default wm:pb-2"
      data-testid="settings-sections"
    >
      <ul class="wm:flex wm:flex-row wm:flex-wrap wm:gap-1">
        <li v-for="section in routing.sections" :key="section.id">
          <UButton
            type="button"
            size="sm"
            color="neutral"
            variant="ghost"
            active-color="primary"
            active-variant="soft"
            :active="section.id === current"
            :aria-current="section.id === current ? 'page' : undefined"
            :class="section.id === current && 'wm:shadow-[inset_0_-3px_0_currentColor]'"
            @click="open(section.id)"
          >
            {{ section.label(catalog) }}
            <component :is="section.badge" v-if="section.badge" />
          </UButton>
        </li>
      </ul>
    </nav>
    <component :is="shown.component" v-if="shown" :key="shown.id" />
    <NotFoundState v-else />
  </div>
</template>
