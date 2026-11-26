<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import type { Matter } from "../../../application/matters";
import { useMessages } from "../../shell";

/**
 * The clarification list (PBI-10 criterion 4, owner decision 26.11.2026): the open and unclear
 * matters that no open or waiting to-do carries, each with a button that adds a to-do for it.
 */
defineProps<{ matters: readonly Matter[]; numbers: ReadonlyMap<string, string> }>();
const emit = defineEmits<{ add: [matter: Matter] }>();
const t = useMessages().matters.todos.clarification;
</script>

<template>
  <section class="wm:flex wm:flex-col wm:gap-2" :aria-label="t.title" data-testid="clarification">
    <h3 class="wm:text-base wm:font-semibold">{{ t.title }}</h3>
    <p class="wm:text-xs wm:text-muted">{{ t.hint }}</p>
    <p v-if="matters.length === 0" class="wm:text-sm" data-testid="clarification-none">
      {{ t.none }}
    </p>
    <ul v-else class="wm:flex wm:flex-col wm:gap-1">
      <li
        v-for="matter in matters"
        :key="matter.path"
        class="wm:flex wm:flex-wrap wm:items-center wm:justify-between wm:gap-2 wm:text-sm"
        data-testid="clarification-matter"
      >
        <span class="wm:wrap-break-word">
          <span class="wm:font-mono">{{ numbers.get(matter.id ?? "") }}</span>
          {{ matter.values.outcome ?? matter.fileName }}
        </span>
        <UButton
          v-if="matter.editable"
          type="button"
          size="xs"
          color="neutral"
          variant="outline"
          icon="i-lucide-plus"
          :label="t.add"
          :aria-label="t.addLabel(numbers.get(matter.id ?? '') ?? matter.fileName)"
          data-testid="clarification-add"
          @click="emit('add', matter)"
        />
      </li>
    </ul>
  </section>
</template>
