<script setup lang="ts">
import UApp from "@nuxt/ui/components/App.vue";
import { de, en } from "@nuxt/ui/locale";
import { computed, type Component } from "vue";
import type { RouteLike } from "../../../application/shell";
import { provideModals } from "../modal";
import { useHistory, useRouting, type FrameEntry } from "../navigation";
import { frameMenu } from "../routing";
import { useMessages } from "../runtime/use-runtime";
import AppFrame from "./AppFrame.vue";
import RouteOutlet from "./RouteOutlet.vue";

/**
 * Root of one surface: the app frame with the screen of the view's route. Portals go to `portal`
 * (inside the view), toasts go through Notifier, and Nuxt UI's built-in labels (close buttons,
 * empty states) follow the UI language. `content` replaces the frame (tests, the harness).
 */
defineProps<{ portal: HTMLElement; content?: Component }>();

const catalog = useMessages();
const locale = catalog.shell.language === "de" ? de : en;
const routing = useRouting();
const history = useHistory();
/** While a screen's sheet or dialog is open, the frame behind it is inert (`useModal`). */
const behindModal = provideModals();

/**
 * An entry is the current page on every route of its screen, whatever the parameters (the section
 * of the settings screen, the record of a detail screen): routes are compared by name.
 */
const isCurrent = (entry: RouteLike, route: RouteLike) => entry.name === route.name;

const entries = computed<FrameEntry[]>(() =>
  frameMenu(routing.definition).map((entry) => ({
    label: entry.label(catalog),
    icon: entry.icon,
    current: isCurrent(entry.route, routing.route.value),
    select: () => routing.navigate(entry.route),
  })),
);
</script>

<template>
  <UApp :locale="locale" :portal="portal" :toaster="null">
    <component :is="content" v-if="content" />
    <AppFrame v-else :entries="entries" :history="history" :inert="behindModal">
      <template v-if="routing.context" #context>
        <component :is="routing.context" />
      </template>
      <RouteOutlet />
    </AppFrame>
  </UApp>
</template>
