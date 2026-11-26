<script setup lang="ts">
import { computed, useId } from "vue";
import { shownName, type Matter } from "../../../application/matters";
import { ChoiceField, TextField } from "../../notes";
import { useMessages } from "../../shell";
import { useMergeForm } from "../use-lineage";
import PanelFormFooter from "./PanelFormFooter.vue";

/**
 * Merges a duplicate into this matter (PBI-07): the duplicate among the other open matters of the
 * same community, a choice per field where the two differ (this matter's value by default), and
 * the reason. The duplicate becomes obsolete and refers to this matter.
 */
const props = defineProps<{
  matter: Matter;
  matters: readonly Matter[];
  numbers: ReadonlyMap<string, string>;
}>();
const emit = defineEmits<{ done: []; cancel: [] }>();

const catalog = useMessages().matters;
const { t, form, command, validators, candidates, conflicts } = useMergeForm(
  () => props.matter,
  () => props.matters,
  () => emit("done"),
);
const choices = computed(() =>
  candidates.value.map((other) => ({
    value: other.id ?? "",
    label: `${props.numbers.get(other.id ?? "") ?? "?"} ${shownName(other)}`,
  })),
);
const group = useId();
const shown = (value: string | undefined) => value ?? t.emptyValue;
</script>

<template>
  <form
    class="wm:flex wm:flex-col wm:gap-3 wm:rounded-md wm:border wm:border-default wm:p-3"
    novalidate
    data-testid="merge-form"
    @submit.prevent="form.handleSubmit()"
  >
    <h4 class="wm:text-sm wm:font-semibold">{{ t.mergeTitle }}</h4>
    <p class="wm:text-xs wm:text-muted">{{ t.mergeHint }}</p>
    <p v-if="choices.length === 0" class="wm:text-sm" data-testid="merge-none">
      {{ t.noCandidates }}
    </p>
    <template v-else>
      <form.Field name="duplicate">
        <template #default="{ field }">
          <ChoiceField
            :label="t.mergeWith"
            :value="field.state.value"
            :options="choices"
            :error="false"
            test-id="merge-duplicate"
            @change="field.handleChange"
          />
        </template>
      </form.Field>
      <p
        v-if="conflicts.length === 0"
        class="wm:text-sm wm:text-muted"
        data-testid="merge-no-conflicts"
      >
        {{ t.noConflicts }}
      </p>
      <form.Field name="choices">
        <template #default="{ field }">
          <fieldset
            v-for="conflict in conflicts"
            :key="conflict.key"
            class="wm:flex wm:flex-col wm:gap-1"
            data-testid="merge-conflict"
          >
            <legend class="wm:text-sm wm:font-medium">{{ catalog.fields[conflict.key] }}</legend>
            <label class="wm:flex wm:items-center wm:gap-2 wm:text-sm">
              <input
                type="radio"
                :name="`${group}-${conflict.key}`"
                :checked="field.state.value[conflict.key] !== 'duplicate'"
                :data-testid="`merge-keep-${conflict.key}`"
                @change="field.handleChange({ ...field.state.value, [conflict.key]: 'target' })"
              />
              {{ t.keepTarget }}: {{ shown(conflict.target) }}
            </label>
            <label class="wm:flex wm:items-center wm:gap-2 wm:text-sm">
              <input
                type="radio"
                :name="`${group}-${conflict.key}`"
                :checked="field.state.value[conflict.key] === 'duplicate'"
                :data-testid="`merge-take-${conflict.key}`"
                @change="field.handleChange({ ...field.state.value, [conflict.key]: 'duplicate' })"
              />
              {{ t.takeDuplicate }}: {{ conflict.duplicate }}
            </label>
          </fieldset>
        </template>
      </form.Field>
      <form.Field name="reason" :validators="validators.reason">
        <template #default="{ field }">
          <TextField
            :label="t.reason"
            :value="field.state.value"
            :error="field.state.meta.errors[0] ?? false"
            test-id="merge-reason"
            required
            @change="field.handleChange"
            @blur="field.handleBlur"
          />
        </template>
      </form.Field>
    </template>
    <PanelFormFooter
      :message="command.message.value"
      :cancel="t.cancel"
      :apply="t.mergeApply"
      apply-id="merge-apply"
      @cancel="emit('cancel')"
    />
  </form>
</template>
