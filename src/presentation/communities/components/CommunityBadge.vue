<script setup lang="ts">
import { computed } from "vue";
import { COMMUNITY_COLORS } from "../../../domain/communities";
import { useMessages } from "../../shell";

/**
 * A community's short code on its colour (handoff CommunityBadge). The code is always shown as
 * text, so the colour never carries meaning alone; without a valid colour the badge is dashed, and
 * without a valid short code it reads `?`.
 */
const props = defineProps<{ shortCode: string | undefined; color: string | undefined }>();

const { noShortCode } = useMessages().communities;
const palette: readonly string[] = COMMUNITY_COLORS;
const color = computed(() =>
  props.color !== undefined && palette.includes(props.color) ? props.color : "none",
);
</script>

<template>
  <span
    class="wm:inline-flex wm:h-6 wm:min-w-9 wm:shrink-0 wm:items-center wm:justify-center wm:rounded wm:px-1.5 wm:font-mono wm:text-xs wm:font-semibold"
    :data-community-color="color"
    data-testid="community-badge"
    >{{ shortCode ?? noShortCode }}</span
  >
</template>
