<script setup lang="ts">
import { computed } from "vue";
import { SETTINGS } from "../../../application/shell";
import { useRouting } from "../navigation";
import NotFoundState from "./NotFoundState.vue";

/**
 * Shows the screen of the surface's route. A route without a screen shows not-found. The key
 * remounts the screen when the route changes, also between two routes of the same screen; the
 * settings screen stays mounted across its sections and remounts only the section, so the entry
 * the user chose in its navigation keeps the focus.
 */
const routing = useRouting();
const screen = computed(() => routing.screenOf(routing.route.value));
const key = computed(() =>
  routing.route.value.name === SETTINGS ? SETTINGS : JSON.stringify(routing.route.value),
);
</script>

<template>
  <component :is="screen" v-if="screen" :key="key" />
  <NotFoundState v-else />
</template>
