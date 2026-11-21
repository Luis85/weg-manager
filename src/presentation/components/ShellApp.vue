<script setup lang="ts">
import UApp from "@nuxt/ui/components/App.vue";
import { de, en } from "@nuxt/ui/locale";
import type { Component } from "vue";
import { useMessages } from "../runtime/use-runtime";
import ShellPanel from "./ShellPanel.vue";

/**
 * Root of one surface: portals go to `portal` (inside the view), toasts go through Notifier,
 * and Nuxt UI's built-in labels (close buttons, empty states) follow the UI language.
 */
defineProps<{ portal: HTMLElement; content?: Component }>();

const locale = useMessages().language === "de" ? de : en;
</script>

<template>
  <UApp :locale="locale" :portal="portal" :toaster="null">
    <component :is="content ?? ShellPanel" />
  </UApp>
</template>
