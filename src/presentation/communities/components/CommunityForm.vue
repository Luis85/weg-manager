<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UFormField from "@nuxt/ui/components/FormField.vue";
import UInput from "@nuxt/ui/components/Input.vue";
import { useId, useTemplateRef } from "vue";
import type { Community } from "../../../application/communities";
import { RecordForm } from "../../notes";
import { useCommunityForm } from "../use-community-form";
import ColorField from "./ColorField.vue";

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

const root = useTemplateRef<{ $el: HTMLElement }>("root");
const {
  form,
  t,
  taken,
  suggestions,
  conflicts,
  validators,
  errorOf,
  choose,
  typed,
  submit,
  resolve,
  label,
  show,
  pending,
  blocked,
  summary,
  notice,
} = useCommunityForm({
  community: props.community,
  communities: () => props.communities,
  root: () => root.value?.$el,
  done: (id) => emit("done", id),
});
const shortCodeText = form.useSelector((state) => state.values.short_code);
const suggestionsId = useId();
</script>

<template>
  <RecordForm
    ref="root"
    form-id="community-form"
    save-id="community-save"
    :cancel="t.form.cancel"
    :save="t.form.save"
    :summary="summary"
    :notice="notice"
    :conflicts="conflicts"
    :pending="pending"
    :blocked="blocked"
    :label="label"
    :show="show"
    @submit="submit"
    @apply="resolve"
    @cancel="emit('cancel')"
  >
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
          :description="t.shortCodeHint"
          :error="errorOf('short_code', field.state.meta)"
        >
          <UInput
            :model-value="field.state.value"
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
  </RecordForm>
</template>
