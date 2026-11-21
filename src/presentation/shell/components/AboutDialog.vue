<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UModal from "@nuxt/ui/components/Modal.vue";
import { useMessages } from "../runtime/use-runtime";

const { about } = useMessages();
</script>

<template>
  <UModal :title="about.title" :description="about.description">
    <UButton icon="i-lucide-info" variant="ghost" size="sm" :label="about.button" />
    <template #body>
      <p class="wm:text-sm" data-testid="about-body">{{ about.body }}</p>
    </template>
  </UModal>
</template>
