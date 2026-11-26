<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import type { Matter } from "../../../application/matters";
import type { SplitPart } from "../../../domain/matters";
import { ChoiceField, TextField } from "../../notes";
import { useMessages } from "../../shell";
import { emptyPart, useSplitForm } from "../use-lineage";
import PanelFormFooter from "./PanelFormFooter.vue";

/**
 * Splits a collective matter into parts (PBI-06): two or more parts, each with its own outcome,
 * responsible, due date or none, clarification status and next step, and the reason. Each part
 * becomes a matter of its own; this one becomes obsolete.
 */
const props = defineProps<{
  matter: Matter;
  contacts: readonly { readonly value: string; readonly label: string }[];
}>();
const emit = defineEmits<{ done: []; cancel: [] }>();

const catalog = useMessages().matters;
const { t, form, command, validators } = useSplitForm(
  () => props.matter,
  () => emit("done"),
);
const responsible = [{ value: "", label: catalog.form.choose }, ...props.contacts];
const statuses = (["open", "unclear"] as const).map((status) => ({
  value: status,
  label: catalog.statuses[status],
}));
/** The parts with `change` applied to the one at `at`. */
const changed = (
  parts: readonly SplitPart[],
  at: number,
  change: Partial<SplitPart>,
): SplitPart[] => parts.map((part, index) => (index === at ? { ...part, ...change } : part));
</script>

<template>
  <form
    class="wm:flex wm:flex-col wm:gap-3 wm:rounded-md wm:border wm:border-default wm:p-3"
    novalidate
    data-testid="split-form"
    @submit.prevent="form.handleSubmit()"
  >
    <h4 class="wm:text-sm wm:font-semibold">{{ t.splitTitle }}</h4>
    <p class="wm:text-xs wm:text-muted">{{ t.splitHint }}</p>
    <form.Field name="parts" :validators="validators.parts">
      <template #default="{ field }">
        <fieldset
          v-for="(part, at) in field.state.value"
          :key="at"
          class="wm:flex wm:flex-col wm:gap-2 wm:border-l-2 wm:border-default wm:pl-2"
          data-testid="split-part"
        >
          <legend class="wm:text-sm wm:font-medium">{{ t.splitPart(at + 1) }}</legend>
          <TextField
            :label="catalog.fields.outcome"
            :value="part.outcome"
            :error="false"
            test-id="part-outcome"
            required
            @change="(outcome) => field.handleChange(changed(field.state.value, at, { outcome }))"
          />
          <ChoiceField
            :label="catalog.fields.responsible_id"
            :value="part.responsible_id"
            :options="responsible"
            :error="false"
            test-id="part-responsible"
            @change="
              (responsible_id) =>
                field.handleChange(changed(field.state.value, at, { responsible_id }))
            "
          />
          <TextField
            :label="catalog.fields.due_on"
            :value="part.due_on"
            :error="false"
            type="date"
            test-id="part-due"
            @change="(due_on) => field.handleChange(changed(field.state.value, at, { due_on }))"
          />
          <ChoiceField
            :label="catalog.fields.status"
            :value="part.status"
            :options="statuses"
            :error="false"
            test-id="part-status"
            @change="
              (status) =>
                field.handleChange(
                  changed(field.state.value, at, { status: status as SplitPart['status'] }),
                )
            "
          />
          <TextField
            :label="catalog.fields.next_step"
            :value="part.next_step"
            :error="false"
            test-id="part-next"
            required
            @change="
              (next_step) => field.handleChange(changed(field.state.value, at, { next_step }))
            "
          />
          <div v-if="field.state.value.length > 2">
            <UButton
              type="button"
              size="xs"
              color="neutral"
              variant="ghost"
              icon="i-lucide-x"
              :label="t.removePart(at + 1)"
              data-testid="part-remove"
              @click="field.handleChange(field.state.value.filter((_, index) => index !== at))"
            />
          </div>
        </fieldset>
        <div>
          <UButton
            type="button"
            size="sm"
            color="neutral"
            variant="outline"
            icon="i-lucide-plus"
            :label="t.addPart"
            data-testid="part-add"
            @click="field.handleChange([...field.state.value, emptyPart()])"
          />
        </div>
        <p
          v-if="field.state.meta.errors[0]"
          class="wm:text-sm wm:text-error"
          data-testid="split-errors"
        >
          {{ field.state.meta.errors[0] }}
        </p>
      </template>
    </form.Field>
    <form.Field name="reason" :validators="validators.reason">
      <template #default="{ field }">
        <TextField
          :label="t.reason"
          :value="field.state.value"
          :error="field.state.meta.errors[0] ?? false"
          test-id="split-reason"
          required
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <PanelFormFooter
      :message="command.message.value"
      :cancel="t.cancel"
      :apply="t.splitApply"
      apply-id="split-apply"
      @cancel="emit('cancel')"
    />
  </form>
</template>
