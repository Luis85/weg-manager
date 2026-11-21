<script setup lang="ts">
import { computed } from "vue";
import { useRouting } from "../navigation";
import NotFoundState from "./NotFoundState.vue";

/**
 * Shows the screen of the surface's route. A route without a screen shows not-found. The key
 * remounts the screen when the route changes, also between two routes of the same screen.
 */
const routing = useRouting();
const screen = computed(() => routing.screenOf(routing.route.value));
const key = computed(() => JSON.stringify(routing.route.value));
</script>

<template>
  <component :is="screen" v-if="screen" :key="key" />
  <NotFoundState v-else />
</template>
