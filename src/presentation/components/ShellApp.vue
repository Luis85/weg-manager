<script setup lang="ts">
import UApp from "@nuxt/ui/components/App.vue";
import { de } from "@nuxt/ui/locale";
import type { Component } from "vue";
import ShellPanel from "./ShellPanel.vue";

/**
 * Root of one surface: portals go to `portal` (inside the view), toasts go through Notifier,
 * and Nuxt UI's built-in labels (close buttons, empty states) are German.
 */
defineProps<{ portal: HTMLElement; content?: Component }>();
</script>

<template>
  <UApp :locale="de" :portal="portal" :toaster="null">
    <component :is="content ?? ShellPanel" />
  </UApp>
</template>
