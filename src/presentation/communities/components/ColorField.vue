<script setup lang="ts">
import UIcon from "@nuxt/ui/components/Icon.vue";
import { computed, useId } from "vue";
import { COMMUNITY_COLORS } from "../../../domain/communities";
import { useMessages } from "../../shell";
import CommunityBadge from "./CommunityBadge.vue";

/**
 * The colour of a community: one radio per palette colour (handoff CommunityForm), so the arrow
 * keys move between them. The group is required. A colour another community uses is disabled,
 * says so in its name and shows that community's short code, so it does not rely on a faded shade;
 * the chosen one shows a check mark, and a badge previews the short code on it.
 */
const props = defineProps<{
  modelValue: string;
  /** The colours other communities use, each with its owner's short code. */
  taken: ReadonlyMap<string, string | undefined>;
  /** The short code as typed, for the preview. */
  shortCode: string;
  error: string | false;
}>();
const emit = defineEmits<{ "update:modelValue": [color: string]; blur: [] }>();

const t = useMessages().communities;
const name = useId();
const legendId = useId();
const errorId = useId();

/** Each palette colour as its radio shows it. */
const swatches = computed(() =>
  COMMUNITY_COLORS.map((color) => {
    const chosen = props.modelValue === color;
    const taken = props.taken.has(color);
    return {
      color,
      chosen,
      disabled: taken && !chosen,
      label: taken ? t.colorTaken(t.colors[color]) : t.colors[color],
      /** What the swatch shows besides its colour: the owner's short code, or a dot. */
      owner: taken && !chosen ? (props.taken.get(color) ?? "•") : "",
    };
  }),
);
const preview = computed(() =>
  props.modelValue === "" ? "" : props.shortCode.trim().toUpperCase(),
);
const invalid = computed(() =>
  props.error === false ? {} : { "aria-invalid": true, "aria-describedby": errorId },
);
</script>

<template>
  <fieldset
    class="wm:flex wm:flex-col wm:gap-1.5"
    role="radiogroup"
    aria-required="true"
    :aria-labelledby="legendId"
    v-bind="invalid"
    data-testid="color-field"
  >
    <legend :id="legendId" class="wm:mb-1.5 wm:text-sm wm:font-medium">{{ t.fields.color }}</legend>
    <div class="wm:flex wm:flex-wrap wm:gap-2">
      <label v-for="swatch in swatches" :key="swatch.color" class="wm:relative wm:inline-flex">
        <input
          type="radio"
          class="wm:peer wm:sr-only"
          :name="name"
          :value="swatch.color"
          :checked="swatch.chosen"
          :disabled="swatch.disabled"
          :aria-label="swatch.label"
          @change="emit('update:modelValue', swatch.color)"
          @blur="emit('blur')"
        />
        <span
          class="wm:inline-flex wm:size-8 wm:items-center wm:justify-center wm:rounded-full wm:font-mono wm:text-[0.625rem] wm:font-semibold wm:ring-offset-2 wm:peer-checked:ring-2 wm:peer-checked:ring-(--wm-text) wm:peer-focus-visible:outline-2 wm:peer-focus-visible:outline-offset-2 wm:peer-focus-visible:outline-(--wm-accent) wm:peer-disabled:cursor-not-allowed wm:peer-disabled:opacity-60"
          :data-community-color="swatch.color"
          aria-hidden="true"
          data-testid="color-swatch"
        >
          <UIcon v-if="swatch.chosen" name="i-lucide-check" class="wm:size-4" />
          {{ swatch.owner }}
        </span>
      </label>
    </div>
    <p
      v-if="preview"
      class="wm:flex wm:items-center wm:gap-2 wm:text-sm wm:text-muted"
      data-testid="color-preview"
    >
      {{ t.preview }}
      <CommunityBadge :short-code="preview" :color="modelValue" />
    </p>
    <p v-if="error" :id="errorId" class="wm:text-sm wm:text-error">{{ error }}</p>
  </fieldset>
</template>
