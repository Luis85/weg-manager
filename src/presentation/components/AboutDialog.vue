<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UModal from "@nuxt/ui/components/Modal.vue";
</script>

<template>
  <UModal
    title="Über WEG Manager"
    description="Werkzeuge für Verwaltungsbeiräte von Wohnungseigentümergemeinschaften."
  >
    <UButton icon="i-lucide-info" variant="ghost" size="sm" label="Über" />
    <template #body>
      <p class="wm:text-sm" data-testid="about-body">
        Version, Plattform und Protokoll kopierst du mit dem Befehl „Diagnose kopieren“.
      </p>
    </template>
  </UModal>
</template>
