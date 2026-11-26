<script setup lang="ts">
import type { Matter } from "../../../application/matters";
import { useMessages } from "../../shell";
import { useMatterSources } from "../use-source-form";
import SourceItem from "./SourceItem.vue";

/** A matter's sources in its history panel (PBI-11 criterion 6), newest first. */
const props = defineProps<{ matter: Matter }>();
const t = useMessages().matters.sources;
const sources = useMatterSources(() => props.matter);
</script>

<template>
  <section class="wm:flex wm:flex-col wm:gap-1" :aria-label="t.title" data-testid="matter-sources">
    <h4 class="wm:text-sm wm:font-semibold">{{ t.title }}</h4>
    <p v-if="sources.length === 0" class="wm:text-sm wm:text-muted">{{ t.none }}</p>
    <ul v-else class="wm:flex wm:flex-col wm:gap-3">
      <SourceItem v-for="source in sources" :key="source.path" :source="source" />
    </ul>
  </section>
</template>
