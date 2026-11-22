<script setup lang="ts">
import UApp from "@nuxt/ui/components/App.vue";
import { de, en } from "@nuxt/ui/locale";
import { computed, type Component } from "vue";
import { provideModals } from "../modal";
import { useHistory, useRouting, type FrameEntry } from "../navigation";
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

const entries = computed<FrameEntry[]>(() =>
  routing.definition.menu.map((entry) => ({
    label: entry.label(catalog),
    icon: entry.icon,
    current: routing.definition.equals(entry.route, routing.route.value),
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
