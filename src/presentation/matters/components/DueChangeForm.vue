<script setup lang="ts">
import type { Matter } from "../../../application/matters";
import { DUE_CHECKS, DUE_KINDS } from "../../../domain/matters";
import { ChoiceField, TextField } from "../../notes";
import { useMessages } from "../../shell";
import { useDueForm } from "../use-history";
import PanelFormFooter from "./PanelFormFooter.vue";

/**
 * Changes a matter's due date with its reason (PBI-09): the new date (empty for none), what it is,
 * who gave it where, and how far it is checked. The earlier date stays in the history; the
 * follow-up date is never touched.
 */
const props = defineProps<{ matter: Matter }>();
const emit = defineEmits<{ done: []; cancel: [] }>();

const catalog = useMessages().matters;
const { t, form, command, validators } = useDueForm(
  () => props.matter,
  () => emit("done"),
);
const none = { value: "", label: catalog.form.choose };
const kinds = [none, ...DUE_KINDS.map((kind) => ({ value: kind, label: catalog.dueKinds[kind] }))];
const checks = [
  none,
  ...DUE_CHECKS.map((check) => ({ value: check, label: catalog.dueChecks[check] })),
];
</script>

<template>
  <form
    class="wm:flex wm:flex-col wm:gap-3 wm:rounded-md wm:border wm:border-default wm:p-3"
    novalidate
    data-testid="due-form"
    @submit.prevent="form.handleSubmit()"
  >
    <h4 class="wm:text-sm wm:font-semibold">{{ t.dueTitle }}</h4>
    <form.Field name="due_on" :validators="validators('due_on')">
      <template #default="{ field }">
        <TextField
          :label="t.dueOn"
          :help="t.dueOnHint"
          :value="field.state.value"
          :error="field.state.meta.errors[0] ?? false"
          type="date"
          test-id="due-on"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="due_kind">
      <template #default="{ field }">
        <ChoiceField
          :label="catalog.fields.due_kind"
          :value="field.state.value"
          :options="kinds"
          :error="false"
          test-id="due-kind"
          @change="field.handleChange"
        />
      </template>
    </form.Field>
    <form.Field name="due_source">
      <template #default="{ field }">
        <TextField
          :label="catalog.fields.due_source"
          :value="field.state.value"
          :error="false"
          test-id="due-source"
          @change="field.handleChange"
        />
      </template>
    </form.Field>
    <form.Field name="due_checked">
      <template #default="{ field }">
        <ChoiceField
          :label="catalog.fields.due_checked"
          :value="field.state.value"
          :options="checks"
          :error="false"
          test-id="due-checked"
          @change="field.handleChange"
        />
      </template>
    </form.Field>
    <form.Field name="reason" :validators="validators('reason')">
      <template #default="{ field }">
        <TextField
          :label="t.reason"
          :help="t.dueReasonHint"
          :value="field.state.value"
          :error="field.state.meta.errors[0] ?? false"
          test-id="due-reason"
          required
          autofocus
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <PanelFormFooter
      :message="command.message.value"
      :cancel="t.cancel"
      :apply="t.dueApply"
      apply-id="due-apply"
      @cancel="emit('cancel')"
    />
  </form>
</template>
