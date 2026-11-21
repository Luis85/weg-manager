<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { useRouting } from "../navigation";
import { useMessages } from "../runtime/use-runtime";

/**
 * What a route to something that no longer exists shows, with a way back to the start route. The
 * frame shows it for a route without a screen; a screen shows it when its record is gone.
 */
const { notFound } = useMessages().shell;
const { definition, navigate } = useRouting();
</script>

<template>
  <div class="wm:m-3 wm:flex wm:flex-col wm:items-start wm:gap-2" data-testid="not-found">
    <h2 class="wm:text-base wm:font-semibold">{{ notFound.title }}</h2>
    <p class="wm:text-sm wm:text-muted">{{ notFound.detail }}</p>
    <UButton
      type="button"
      icon="i-lucide-layout-dashboard"
      variant="outline"
      size="sm"
      :label="notFound.back"
      @click="navigate(definition.start)"
    />
  </div>
</template>
