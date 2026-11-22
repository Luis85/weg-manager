<script setup lang="ts">
import UIcon from "@nuxt/ui/components/Icon.vue";
import { useId } from "vue";
import { COMMUNITY_COLORS } from "../../../domain/communities";
import { useMessages } from "../../shell";

/**
 * The colour of a community: one radio per palette colour (handoff CommunityForm), so the arrow
 * keys move between them. A colour another community uses is disabled and says so in its name;
 * the chosen one shows a check mark, not only its colour.
 */
defineProps<{
  modelValue: string;
  taken: ReadonlyMap<string, string | undefined>;
  error: string | false;
}>();
const emit = defineEmits<{ "update:modelValue": [color: string]; blur: [] }>();

const t = useMessages().communities;
const name = useId();
const errorId = useId();
</script>

<template>
  <fieldset
    class="wm:flex wm:flex-col wm:gap-1.5"
    :aria-describedby="error ? errorId : undefined"
    data-testid="color-field"
  >
    <legend class="wm:mb-1.5 wm:text-sm wm:font-medium">{{ t.fields.color }}</legend>
    <div class="wm:flex wm:flex-wrap wm:gap-2">
      <label v-for="color in COMMUNITY_COLORS" :key="color" class="wm:relative wm:inline-flex">
        <input
          type="radio"
          class="wm:peer wm:sr-only"
          :name="name"
          :value="color"
          :checked="modelValue === color"
          :disabled="taken.has(color) && modelValue !== color"
          :aria-label="taken.has(color) ? t.colorTaken(t.colors[color]) : t.colors[color]"
          @change="emit('update:modelValue', color)"
          @blur="emit('blur')"
        />
        <span
          class="wm:inline-flex wm:size-8 wm:items-center wm:justify-center wm:rounded-full wm:ring-offset-2 wm:peer-checked:ring-2 wm:peer-checked:ring-(--wm-text) wm:peer-focus-visible:outline-2 wm:peer-focus-visible:outline-offset-2 wm:peer-focus-visible:outline-(--wm-accent) wm:peer-disabled:opacity-30 wm:peer-disabled:cursor-not-allowed"
          :data-community-color="color"
          aria-hidden="true"
        >
          <UIcon v-if="modelValue === color" name="i-lucide-check" class="wm:size-4" />
        </span>
      </label>
    </div>
    <p v-if="error" :id="errorId" class="wm:text-sm wm:text-error">{{ error }}</p>
  </fieldset>
</template>
