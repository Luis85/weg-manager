<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UFormField from "@nuxt/ui/components/FormField.vue";
import UInput from "@nuxt/ui/components/Input.vue";
import { useId, useTemplateRef } from "vue";
import type { Community } from "../../../application/communities";
import { ErrorNotice } from "../../shell";
import { useCommunityForm } from "../use-community-form";
import ColorField from "./ColorField.vue";
import ConflictChoice from "./ConflictChoice.vue";

/**
 * Creates a community or edits one (`community` set), in one form (handoff CommunityForm); the
 * state and rules are `useCommunityForm`. Every field is required, which each input says with
 * `aria-required` (no asterisk in its name). A failed submit puts a summary at the top and the
 * focus on the first invalid field; a conflict takes the focus to its heading. The buttons stay
 * in view at the bottom of the sheet, also at 200 % zoom. Save is never `disabled` while it may
 * hold the focus: it says `aria-disabled` and does nothing.
 */
const props = defineProps<{
  community?: Community | undefined;
  communities: readonly Community[];
}>();
const emit = defineEmits<{ done: [id: string]; cancel: [] }>();

const root = useTemplateRef<HTMLFormElement>("root");
const {
  form,
  t,
  shortCodeEditable,
  taken,
  suggestions,
  conflicts,
  validators,
  errorOf,
  choose,
  typed,
  submit,
  resolve,
  pending,
  blocked,
  summary,
  notice,
} = useCommunityForm({
  community: props.community,
  communities: () => props.communities,
  root: () => root.value ?? undefined,
  done: (id) => emit("done", id),
});
const shortCodeText = form.useSelector((state) => state.values.short_code);
const suggestionsId = useId();
</script>

<template>
  <form
    ref="root"
    class="wm:flex wm:min-h-full wm:flex-col"
    novalidate
    data-testid="community-form"
    @submit.prevent="submit"
  >
    <div class="wm:flex wm:flex-1 wm:flex-col wm:gap-4 wm:p-4 wm:sm:p-6">
      <ErrorNotice v-if="summary" :message="summary" data-testid="form-summary" />
      <form.Field name="name" :validators="validators('name')">
        <template #default="{ field }">
          <UFormField
            :label="t.fields.name"
            :name="field.name"
            :error="errorOf('name', field.state.meta)"
          >
            <UInput
              :model-value="field.state.value"
              class="wm:w-full"
              aria-required="true"
              data-autofocus
              data-testid="field-name"
              @update:model-value="(next: string | number) => field.handleChange(String(next))"
              @blur="field.handleBlur"
            />
          </UFormField>
        </template>
      </form.Field>
      <form.Field name="short_code" :validators="validators('short_code')">
        <template #default="{ field }">
          <UFormField
            :label="t.fields.short_code"
            :name="field.name"
            :description="shortCodeEditable ? t.shortCodeHint : t.shortCodeFixed"
            :error="errorOf('short_code', field.state.meta)"
          >
            <UInput
              :model-value="field.state.value"
              :readonly="!shortCodeEditable"
              maxlength="5"
              autocapitalize="characters"
              aria-required="true"
              class="wm:w-28 wm:font-mono"
              data-testid="field-short_code"
              @update:model-value="
                (next: string | number) => field.handleChange(String(next).toUpperCase())
              "
              @blur="field.handleBlur"
            />
          </UFormField>
        </template>
      </form.Field>
      <form.Field name="color" :validators="validators('color')">
        <template #default="{ field }">
          <ColorField
            :model-value="field.state.value"
            :taken="taken"
            :short-code="shortCodeText"
            :error="errorOf('color', field.state.meta)"
            @update:model-value="field.handleChange"
            @blur="field.handleBlur"
          />
        </template>
      </form.Field>
      <form.Field name="kind" :validators="validators('kind')">
        <template #default="{ field }">
          <UFormField
            :label="t.fields.kind"
            :name="field.name"
            :error="errorOf('kind', field.state.meta)"
          >
            <UInput
              :model-value="field.state.value"
              class="wm:w-full"
              aria-required="true"
              data-testid="field-kind"
              @update:model-value="
                (next: string | number) => typed('kind', field.handleChange, String(next))
              "
              @blur="field.handleBlur"
            />
          </UFormField>
          <div
            class="wm:mt-1.5 wm:flex wm:flex-wrap wm:items-center wm:gap-1.5"
            role="group"
            :aria-labelledby="suggestionsId"
            data-testid="kind-suggestions"
          >
            <span :id="suggestionsId" class="wm:text-xs wm:text-muted">
              {{ t.suggestions }}
            </span>
            <UButton
              v-for="pair in suggestions"
              :key="t.suggestion(pair)"
              type="button"
              size="xs"
              color="neutral"
              variant="soft"
              :label="t.suggestion(pair)"
              @click="choose(pair)"
            />
          </div>
        </template>
      </form.Field>
      <form.Field name="unit_label" :validators="validators('unit_label')">
        <template #default="{ field }">
          <UFormField
            :label="t.fields.unit_label"
            :name="field.name"
            :help="t.unitLabelHelp"
            :error="errorOf('unit_label', field.state.meta)"
          >
            <UInput
              :model-value="field.state.value"
              class="wm:w-full"
              aria-required="true"
              data-testid="field-unit_label"
              @update:model-value="
                (next: string | number) => typed('unit_label', field.handleChange, String(next))
              "
              @blur="field.handleBlur"
            />
          </UFormField>
        </template>
      </form.Field>
      <ConflictChoice
        v-if="conflicts"
        :conflicts="conflicts"
        :disabled="pending"
        @apply="resolve"
      />
      <ErrorNotice v-if="notice" :message="notice" />
    </div>
    <div
      class="wm:sticky wm:bottom-0 wm:flex wm:flex-wrap wm:justify-end wm:gap-2 wm:border-t wm:border-default wm:bg-default wm:px-4 wm:py-3 wm:sm:px-6"
      data-testid="form-footer"
    >
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        :label="t.form.cancel"
        @click="emit('cancel')"
      />
      <UButton
        type="submit"
        :label="t.form.save"
        :icon="pending ? 'i-lucide-loader-circle' : undefined"
        :ui="{ leadingIcon: pending ? 'wm:animate-spin' : '' }"
        :aria-disabled="blocked ? 'true' : undefined"
        :aria-busy="pending ? 'true' : undefined"
        class="wm:aria-disabled:cursor-not-allowed wm:aria-disabled:opacity-75"
        data-testid="community-save"
      />
    </div>
  </form>
</template>
