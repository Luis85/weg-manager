<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { useTemplateRef } from "vue";
import type { Community } from "../../../application/communities";
import type { Contact } from "../../../application/contacts";
import type { Matter } from "../../../application/matters";
import { UNKNOWN_SOURCE } from "../../../domain/matters";
import { ChoiceField, RecordForm, TextField } from "../../notes";
import { useMatterForm } from "../use-matter-form";

/**
 * Captures a matter or edits one (`matter` set), in one form (PBI-05); the state and rules are
 * `useMatterForm`. A new matter's number is given on save; an existing one's can be changed, to
 * repair a duplicate. "Quelle unbekannt" fills the source gap, so capturing never blocks. A failed
 * submit puts a summary at the top and the focus on the first invalid field.
 */
const props = defineProps<{
  matter?: Matter | undefined;
  matters: readonly Matter[];
  communities: readonly Community[];
  contacts: readonly Contact[];
  community: string | undefined;
}>();
const emit = defineEmits<{ done: [id: string]; cancel: [] }>();

const root = useTemplateRef<{ $el: HTMLElement }>("root");
const {
  form,
  t,
  communities: communityChoices,
  contacts: contactChoices,
  kinds,
  statuses,
  isNew,
  conflicts,
  validators,
  errorOf,
  submit,
  resolve,
  label,
  show,
  pending,
  blocked,
  summary,
  notice,
} = useMatterForm({
  matter: props.matter,
  matters: () => props.matters,
  communities: () => props.communities,
  contacts: () => props.contacts,
  community: props.community,
  root: () => root.value?.$el,
  done: (id) => emit("done", id),
});

/** The number field's text as a number, or unset when blank. */
const toNumber = (text: string): number | undefined =>
  text.trim() === "" ? undefined : Number(text);
/** The text fields in file order: key, input type, required, help. */
const texts = [
  { key: "topic", required: true },
  { key: "outcome", required: true },
] as const;
const dates = ["promised_on", "due_on", "follow_up_on", "done_on"] as const;
const tail = ["next_step", "message_ref", "link"] as const;
</script>

<template>
  <RecordForm
    ref="root"
    form-id="matter-form"
    save-id="matter-save"
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
    <p v-if="isNew" class="wm:text-sm wm:text-muted" data-testid="number-hint">
      {{ t.form.numberHint }}
    </p>
    <form.Field v-else name="number" :validators="validators('number')">
      <template #default="{ field }">
        <TextField
          :label="t.fields.number"
          :value="field.state.value === undefined ? '' : String(field.state.value)"
          :error="errorOf('number', field.state.meta)"
          type="number"
          test-id="field-number"
          required
          @change="(text) => field.handleChange(toNumber(text))"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="community_id" :validators="validators('community_id')">
      <template #default="{ field }">
        <ChoiceField
          :label="t.fields.community_id"
          :value="field.state.value"
          :options="communityChoices"
          :error="errorOf('community_id', field.state.meta)"
          test-id="field-community_id"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="kind" :validators="validators('kind')">
      <template #default="{ field }">
        <ChoiceField
          :label="t.fields.kind"
          :value="field.state.value"
          :options="kinds"
          :error="errorOf('kind', field.state.meta)"
          test-id="field-kind"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field
      v-for="item in texts"
      :key="item.key"
      :name="item.key"
      :validators="validators(item.key)"
    >
      <template #default="{ field }">
        <TextField
          :label="t.fields[item.key]"
          :value="field.state.value"
          :error="errorOf(item.key, field.state.meta)"
          :test-id="`field-${item.key}`"
          :required="item.required"
          :autofocus="item.key === 'topic'"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="responsible_id" :validators="validators('responsible_id')">
      <template #default="{ field }">
        <ChoiceField
          :label="t.fields.responsible_id"
          :value="field.state.value"
          :options="contactChoices"
          :error="errorOf('responsible_id', field.state.meta)"
          test-id="field-responsible_id"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="status" :validators="validators('status')">
      <template #default="{ field }">
        <ChoiceField
          :label="t.fields.status"
          :value="field.state.value"
          :options="statuses"
          :error="errorOf('status', field.state.meta)"
          test-id="field-status"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <div class="wm:grid wm:grid-cols-1 wm:gap-4 wm:sm:grid-cols-2">
      <form.Field v-for="key in dates" :key="key" :name="key" :validators="validators(key)">
        <template #default="{ field }">
          <TextField
            :label="t.fields[key]"
            :value="field.state.value"
            :error="errorOf(key, field.state.meta)"
            :help="key === 'follow_up_on' ? t.form.followUpHint : undefined"
            type="date"
            :test-id="`field-${key}`"
            @change="field.handleChange"
            @blur="field.handleBlur"
          />
        </template>
      </form.Field>
    </div>
    <form.Field name="source" :validators="validators('source')">
      <template #default="{ field }">
        <div class="wm:flex wm:flex-col wm:gap-1">
          <TextField
            :label="t.fields.source"
            :value="field.state.value"
            :error="errorOf('source', field.state.meta)"
            :help="t.form.sourceHint"
            test-id="field-source"
            required
            @change="field.handleChange"
            @blur="field.handleBlur"
          />
          <div>
            <UButton
              type="button"
              size="xs"
              color="neutral"
              variant="soft"
              :label="t.form.sourceUnknown"
              data-testid="source-unknown"
              @click="field.handleChange(UNKNOWN_SOURCE)"
            />
          </div>
        </div>
      </template>
    </form.Field>
    <form.Field v-for="key in tail" :key="key" :name="key" :validators="validators(key)">
      <template #default="{ field }">
        <TextField
          :label="t.fields[key]"
          :value="field.state.value"
          :error="errorOf(key, field.state.meta)"
          :test-id="`field-${key}`"
          :required="key === 'next_step'"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
  </RecordForm>
</template>
