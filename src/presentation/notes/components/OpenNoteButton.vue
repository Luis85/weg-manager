<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { openNote } from "../../../application/notes";
import { ErrorNotice, useCommand, useMessages } from "../../shell";

/**
 * Opens a note the plugin cannot write (read-only, of no known type, unreadable) in a new Obsidian
 * tab, so the user can repair it by hand. `name` names it for screen readers. A note that is gone
 * by now says so below the button.
 */
const props = defineProps<{ path: string; name: string }>();

const t = useMessages().notes.openNote;
const open = useCommand(openNote);
</script>

<template>
  <div class="wm:flex wm:flex-col wm:items-start wm:gap-2">
    <UButton
      type="button"
      size="sm"
      color="neutral"
      variant="outline"
      icon="i-lucide-external-link"
      :label="t.label"
      :aria-label="t.labelFor(props.name)"
      data-testid="open-note"
      @click="open.run(props.path)"
    />
    <ErrorNotice v-if="open.message.value" :message="open.message.value" />
  </div>
</template>
