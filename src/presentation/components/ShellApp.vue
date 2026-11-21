<script setup lang="ts">
import UApp from "@nuxt/ui/components/App.vue";
import type { Component } from "vue";
import ShellPanel from "./ShellPanel.vue";

/** Root of one surface: portals go to `portal` (inside the view), toasts go through Notifier. */
defineProps<{ portal: HTMLElement; content?: Component }>();
</script>

<template>
  <UApp :portal="portal" :toaster="null">
    <component :is="content ?? ShellPanel" />
  </UApp>
</template>
