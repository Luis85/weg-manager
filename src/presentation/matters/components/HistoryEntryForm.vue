<script setup lang="ts">
import { computed } from "vue";
import type { Matter } from "../../../application/matters";
import { BOARD_ACTOR, MANUAL_ENTRY_KINDS, type HistoryLine } from "../../../domain/matters";
import { ChoiceField, TextField } from "../../notes";
import { useEntryForm } from "../use-history";
import PanelFormFooter from "./PanelFormFooter.vue";

/**
 * Adds an entry to a matter's history by hand (PBI-12): its kind, what happened, the day (empty
 * when unknown), who did it (the board or a contact), the source, and the entry it corrects, if
 * any. Entries are never changed; a correction is a new entry.
 */
const props = defineProps<{
  matter: Matter;
  lines: readonly HistoryLine[];
  contacts: readonly { readonly value: string; readonly label: string }[];
}>();
const emit = defineEmits<{ done: []; cancel: [] }>();

const { t, form, command, validators } = useEntryForm(
  () => props.matter,
  () => emit("done"),
);
const kinds = MANUAL_ENTRY_KINDS.map((kind) => ({ value: kind, label: t.kinds[kind] }));
const actors = computed(() => [{ value: BOARD_ACTOR, label: t.board }, ...props.contacts]);
const corrects = computed(() => [
  { value: "", label: t.noCorrection },
  ...props.lines.flatMap((line) =>
    line.kind === "entry"
      ? [{ value: line.entry.id, label: `${line.entry.occurred_on ?? "?"} ${line.entry.text}` }]
      : [],
  ),
]);
</script>

<template>
  <form
    class="wm:flex wm:flex-col wm:gap-3 wm:rounded-md wm:border wm:border-default wm:p-3"
    novalidate
    data-testid="entry-form"
    @submit.prevent="form.handleSubmit()"
  >
    <h4 class="wm:text-sm wm:font-semibold">{{ t.addTitle }}</h4>
    <form.Field name="kind">
      <template #default="{ field }">
        <ChoiceField
          :label="t.kind"
          :value="field.state.value"
          :options="kinds"
          :error="false"
          test-id="entry-kind"
          @change="(value) => field.handleChange(value as typeof field.state.value)"
        />
      </template>
    </form.Field>
    <form.Field name="text" :validators="validators('text')">
      <template #default="{ field }">
        <TextField
          :label="t.text"
          :value="field.state.value"
          :error="field.state.meta.errors[0] ?? false"
          test-id="entry-text"
          required
          autofocus
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="occurred_on" :validators="validators('occurred_on')">
      <template #default="{ field }">
        <TextField
          :label="t.day"
          :help="t.dayHint"
          :value="field.state.value"
          :error="field.state.meta.errors[0] ?? false"
          type="date"
          test-id="entry-day"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="actor">
      <template #default="{ field }">
        <ChoiceField
          :label="t.actor"
          :value="field.state.value"
          :options="actors"
          :error="false"
          test-id="entry-actor"
          @change="field.handleChange"
        />
      </template>
    </form.Field>
    <form.Field name="source">
      <template #default="{ field }">
        <TextField
          :label="t.source"
          :value="field.state.value"
          :error="false"
          test-id="entry-source"
          @change="field.handleChange"
        />
      </template>
    </form.Field>
    <form.Field name="corrects">
      <template #default="{ field }">
        <ChoiceField
          :label="t.corrects"
          :value="field.state.value"
          :options="corrects"
          :error="false"
          test-id="entry-corrects"
          @change="field.handleChange"
        />
      </template>
    </form.Field>
    <PanelFormFooter
      :message="command.message.value"
      :cancel="t.cancel"
      :apply="t.save"
      apply-id="entry-save"
      @cancel="emit('cancel')"
    />
  </form>
</template>
