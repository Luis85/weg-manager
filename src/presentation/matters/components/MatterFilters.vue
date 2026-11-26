<script setup lang="ts">
import UInput from "@nuxt/ui/components/Input.vue";
import { computed } from "vue";
import { MATTER_STATUSES, type MatterFilter, type MatterStatus } from "../../../domain/matters";
import { ChoiceField } from "../../notes";
import { useMessages } from "../../shell";

/**
 * The search and the filters of the matter list (PBI-05 criterion 3): a search over topic,
 * outcome, next step and number, and a choice each of topic, status, community and responsible.
 * An empty choice means "all".
 */
const props = defineProps<{
  filter: MatterFilter;
  topics: readonly string[];
  communities: readonly { readonly value: string; readonly label: string }[];
  responsible: readonly { readonly value: string; readonly label: string }[];
}>();
const emit = defineEmits<{ change: [filter: MatterFilter] }>();

const t = useMessages().matters;
const set = (part: Partial<Record<keyof MatterFilter, string>>) => {
  const next: Record<string, string | undefined> = { ...props.filter };
  for (const [key, value] of Object.entries(part)) next[key] = value === "" ? undefined : value;
  emit("change", next as MatterFilter);
};
const topicChoices = computed(() => [
  { value: "", label: t.screen.allTopics },
  ...props.topics.map((topic) => ({ value: topic, label: topic })),
]);
const statusChoices = [
  { value: "", label: t.screen.allStatuses },
  ...MATTER_STATUSES.map((status: MatterStatus) => ({ value: status, label: t.statuses[status] })),
];
const communityChoices = computed(() => [
  { value: "", label: t.screen.allCommunities },
  ...props.communities,
]);
const responsibleChoices = computed(() => [
  { value: "", label: t.screen.allResponsible },
  ...props.responsible,
]);
</script>

<template>
  <div class="wm:flex wm:flex-col wm:gap-2" data-testid="matter-filters">
    <UInput
      :model-value="filter.search ?? ''"
      type="search"
      icon="i-lucide-search"
      :aria-label="t.screen.search"
      :placeholder="t.screen.search"
      class="wm:w-full"
      data-testid="matter-search"
      @update:model-value="(value: string | number) => set({ search: String(value) })"
    />
    <div class="wm:grid wm:grid-cols-1 wm:gap-2 wm:sm:grid-cols-2">
      <ChoiceField
        :label="t.fields.topic"
        :value="filter.topic ?? ''"
        :options="topicChoices"
        :error="false"
        test-id="filter-topic"
        @change="(topic) => set({ topic })"
      />
      <ChoiceField
        :label="t.fields.status"
        :value="filter.status ?? ''"
        :options="statusChoices"
        :error="false"
        test-id="filter-status"
        @change="(status) => set({ status })"
      />
      <ChoiceField
        :label="t.fields.community_id"
        :value="filter.community ?? ''"
        :options="communityChoices"
        :error="false"
        test-id="filter-community"
        @change="(community) => set({ community })"
      />
      <ChoiceField
        :label="t.fields.responsible_id"
        :value="filter.responsible ?? ''"
        :options="responsibleChoices"
        :error="false"
        test-id="filter-responsible"
        @change="(responsible) => set({ responsible })"
      />
    </div>
  </div>
</template>
