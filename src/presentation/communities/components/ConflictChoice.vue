<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { onMounted, reactive, useId, useTemplateRef } from "vue";
import type { CommunityKey } from "../../../domain/communities";
import { useMessages } from "../../shell";
import type { ConflictChoices, FieldConflict } from "../conflict";

/**
 * The per-field choice after an outside edit (ADR 0007, VIEW-07 "Konflikt klären"): for each
 * field both sides changed, the value when the form opened, the user's and the note's current
 * one. The user picks one per field; `apply` hands the choices back for the form to save again.
 * It takes the focus to its heading when it appears, so a screen reader announces it and the
 * keyboard continues there (WCAG 2.4.3); the save button it replaces may hold the focus no longer.
 */
const props = defineProps<{ conflicts: readonly FieldConflict[]; disabled: boolean }>();
const emit = defineEmits<{ apply: [choices: ConflictChoices] }>();

const t = useMessages().communities;
const titleId = useId();
const title = useTemplateRef<HTMLElement>("title");
onMounted(() => title.value?.focus());
const apply = () => {
  if (!props.disabled) emit("apply", { ...choices });
};
const choices = reactive<Record<string, "mine" | "theirs">>(
  Object.fromEntries(props.conflicts.map(({ key }) => [key, "mine"])),
);

const shown = (value: unknown): string =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? String(value)
    : t.conflict.empty;
const label = (key: string): string => t.fields[key as CommunityKey];
</script>

<template>
  <section
    class="wm:flex wm:flex-col wm:gap-3 wm:rounded wm:border wm:border-warning wm:p-3"
    role="group"
    :aria-labelledby="titleId"
    data-testid="community-conflict"
  >
    <h3 :id="titleId" ref="title" tabindex="-1" class="wm:text-sm wm:font-semibold">
      {{ t.conflict.title }}
    </h3>
    <p class="wm:text-sm">{{ t.conflict.detail }}</p>
    <fieldset
      v-for="conflict in conflicts"
      :key="conflict.key"
      class="wm:flex wm:flex-col wm:gap-1"
      :data-testid="`conflict-${conflict.key}`"
    >
      <legend class="wm:text-sm wm:font-medium">{{ label(conflict.key) }}</legend>
      <p class="wm:text-xs wm:text-muted">{{ t.conflict.loaded(shown(conflict.base)) }}</p>
      <label class="wm:flex wm:items-center wm:gap-2 wm:text-sm">
        <input
          v-model="choices[conflict.key]"
          type="radio"
          value="mine"
          :name="`conflict-${conflict.key}`"
          data-testid="choose-mine"
        />
        <span>{{ t.conflict.mine(shown(conflict.edited)) }}</span>
      </label>
      <label class="wm:flex wm:items-center wm:gap-2 wm:text-sm">
        <input
          v-model="choices[conflict.key]"
          type="radio"
          value="theirs"
          :name="`conflict-${conflict.key}`"
          data-testid="choose-theirs"
        />
        <span>{{ t.conflict.theirs(shown(conflict.current)) }}</span>
      </label>
    </fieldset>
    <div>
      <UButton
        type="button"
        :label="t.conflict.apply"
        :aria-disabled="disabled ? 'true' : undefined"
        class="wm:aria-disabled:cursor-not-allowed wm:aria-disabled:opacity-75"
        data-testid="conflict-apply"
        @click="apply"
      />
    </div>
  </section>
</template>
