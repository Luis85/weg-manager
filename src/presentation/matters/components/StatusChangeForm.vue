<script setup lang="ts">
import type { Matter } from "../../../application/matters";
import { MATTER_STATUSES } from "../../../domain/matters";
import { ChoiceField, TextField } from "../../notes";
import { useMessages } from "../../shell";
import { useStatusForm } from "../use-history";
import PanelFormFooter from "./PanelFormFooter.vue";

/**
 * Changes a matter's status with its reason (PBI-08): the new status, the reason, the source
 * (required to close it) and, for done, the day it was done. Status and entry are written in one
 * step.
 */
const props = defineProps<{ matter: Matter; today: string }>();
const emit = defineEmits<{ done: []; cancel: [] }>();

const statuses = useMessages().matters.statuses;
const { t, form, command, validators } = useStatusForm(
  () => props.matter,
  props.today,
  () => emit("done"),
);
const choices = MATTER_STATUSES.map((status) => ({ value: status, label: statuses[status] }));
const target = form.useSelector((state) => state.values.to);
</script>

<template>
  <form
    class="wm:flex wm:flex-col wm:gap-3 wm:rounded-md wm:border wm:border-default wm:p-3"
    novalidate
    data-testid="status-form"
    @submit.prevent="form.handleSubmit()"
  >
    <h4 class="wm:text-sm wm:font-semibold">{{ t.changeTitle }}</h4>
    <form.Field name="to" :validators="validators('to')">
      <template #default="{ field }">
        <ChoiceField
          :label="t.to"
          :value="field.state.value"
          :options="choices"
          :error="field.state.meta.errors[0] ?? false"
          test-id="status-to"
          @change="(value) => field.handleChange(value as typeof field.state.value)"
        />
      </template>
    </form.Field>
    <form.Field name="reason" :validators="validators('reason')">
      <template #default="{ field }">
        <TextField
          :label="t.reason"
          :help="t.reasonHint"
          :value="field.state.value"
          :error="field.state.meta.errors[0] ?? false"
          test-id="status-reason"
          required
          autofocus
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="source" :validators="validators('source')">
      <template #default="{ field }">
        <TextField
          :label="t.sourceForClosing"
          :value="field.state.value"
          :error="field.state.meta.errors[0] ?? false"
          test-id="status-source"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field v-if="target === 'done'" name="done_on" :validators="validators('done_on')">
      <template #default="{ field }">
        <TextField
          :label="t.doneOn"
          :value="field.state.value"
          :error="field.state.meta.errors[0] ?? false"
          type="date"
          test-id="status-done_on"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <PanelFormFooter
      :message="command.message.value"
      :cancel="t.cancel"
      :apply="t.apply"
      apply-id="status-apply"
      @cancel="emit('cancel')"
    />
  </form>
</template>
