<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { useTemplateRef } from "vue";
import type { Community } from "../../../application/communities";
import type { Contact } from "../../../application/contacts";
import type { Matter } from "../../../application/matters";
import { DUE_CHECKS, DUE_KINDS, UNKNOWN_SOURCE } from "../../../domain/matters";
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
  { key: "topic", required: true, autofocus: true },
  { key: "outcome", required: true, autofocus: false },
] as const;
/** The dates the form sets: all of them on create; on edit not the due and done dates (PBI-09). */
const dates = isNew
  ? (["promised_on", "due_on", "follow_up_on", "done_on"] as const)
  : (["promised_on", "follow_up_on"] as const);
const dueChoices = ["due_kind", "due_checked"] as const;
/** The help beside a date: the follow-up date's alone. */
const dateHelp: Partial<Record<(typeof dates)[number], string>> = {
  follow_up_on: t.form.followUpHint,
};
/** The fields of the tail that are required. */
const required: ReadonlySet<string> = new Set(["next_step"]);
/** The number as its field shows it. */
const numberText = (value: number | undefined): string =>
  value === undefined ? "" : String(value);
const none = { value: "", label: t.form.choose };
const dueKinds = [none, ...DUE_KINDS.map((kind) => ({ value: kind, label: t.dueKinds[kind] }))];
const dueChecks = [
  none,
  ...DUE_CHECKS.map((check) => ({ value: check, label: t.dueChecks[check] })),
];
const dueOptions = { due_kind: dueKinds, due_checked: dueChecks };
/** What an edited matter's status and due date are, read-only here. */
const lockedFacts = (() => {
  const values = props.matter?.values;
  if (values === undefined) return "";
  return [
    values.status === undefined ? undefined : t.statuses[values.status],
    values.due_on === undefined ? t.screen.noDue : t.screen.due(values.due_on),
    values.done_on === undefined ? undefined : `${t.fields.done_on} ${values.done_on}`,
  ]
    .filter((part) => part !== undefined)
    .join(" · ");
})();
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
          :value="numberText(field.state.value)"
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
          :autofocus="item.autofocus"
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
    <template v-if="isNew">
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
      <form.Field v-for="key in dueChoices" :key="key" :name="key" :validators="validators(key)">
        <template #default="{ field }">
          <ChoiceField
            :label="t.fields[key]"
            :value="field.state.value"
            :options="dueOptions[key]"
            :error="errorOf(key, field.state.meta)"
            :test-id="`field-${key}`"
            @change="field.handleChange"
            @blur="field.handleBlur"
          />
        </template>
      </form.Field>
      <form.Field name="due_source" :validators="validators('due_source')">
        <template #default="{ field }">
          <TextField
            :label="t.fields.due_source"
            :value="field.state.value"
            :error="errorOf('due_source', field.state.meta)"
            test-id="field-due_source"
            @change="field.handleChange"
            @blur="field.handleBlur"
          />
        </template>
      </form.Field>
    </template>
    <div
      v-else
      class="wm:rounded-md wm:border wm:border-default wm:p-3 wm:text-sm"
      data-testid="matter-locked"
    >
      <p class="wm:font-medium">{{ t.locked.title }}</p>
      <p>{{ lockedFacts }}</p>
      <p class="wm:text-xs wm:text-muted">{{ t.locked.hint }}</p>
    </div>
    <div class="wm:grid wm:grid-cols-1 wm:gap-4 wm:sm:grid-cols-2">
      <form.Field v-for="key in dates" :key="key" :name="key" :validators="validators(key)">
        <template #default="{ field }">
          <TextField
            :label="t.fields[key]"
            :value="field.state.value"
            :error="errorOf(key, field.state.meta)"
            :help="dateHelp[key]"
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
          :required="required.has(key)"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
  </RecordForm>
</template>
