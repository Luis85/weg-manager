<script setup lang="ts">
import type { FieldConflict } from "../../../domain/notes";
import type { ConflictChoices } from "../conflict";
import type { UserMessage } from "../../../application/shell";
import { ErrorNotice } from "../../shell";
import ConflictChoice from "./ConflictChoice.vue";
import RecordFormFooter from "./RecordFormFooter.vue";

/**
 * The frame of every record form (`useRecordForm` holds its state): the summary of a failed
 * submit at the top, the fields in the default slot, the conflict choice and any other notice
 * after them, and cancel and save at the bottom (`RecordFormFooter`). The `form` element is this
 * component's root, so a form reaches it as the component's `$el` for the focus.
 */
defineProps<{
  /** The form's test id, per record type (`community-form`). */
  formId: string;
  saveId: string;
  cancel: string;
  save: string;
  summary: UserMessage | undefined;
  notice: UserMessage | undefined;
  conflicts: readonly FieldConflict[] | undefined;
  pending: boolean;
  blocked: boolean;
  label: (key: string) => string;
  show: (key: string, value: unknown) => string;
}>();
const emit = defineEmits<{ submit: []; apply: [choices: ConflictChoices]; cancel: [] }>();
</script>

<template>
  <form
    class="wm:flex wm:min-h-full wm:flex-col"
    novalidate
    :data-testid="formId"
    @submit.prevent="emit('submit')"
  >
    <div class="wm:flex wm:flex-1 wm:flex-col wm:gap-4 wm:p-4 wm:sm:p-6">
      <ErrorNotice v-if="summary" :message="summary" data-testid="form-summary" />
      <slot />
      <ConflictChoice
        v-if="conflicts"
        :conflicts="conflicts"
        :disabled="pending"
        :label="label"
        :show="show"
        @apply="(choices) => emit('apply', choices)"
      />
      <ErrorNotice v-if="notice" :message="notice" />
    </div>
    <RecordFormFooter
      :cancel="cancel"
      :save="save"
      :pending="pending"
      :blocked="blocked"
      :save-id="saveId"
      @cancel="emit('cancel')"
    />
  </form>
</template>
