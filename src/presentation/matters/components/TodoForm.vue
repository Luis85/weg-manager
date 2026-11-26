<script setup lang="ts">
import { useTemplateRef } from "vue";
import type { Contact } from "../../../application/contacts";
import type { Matter, Todo } from "../../../application/matters";
import type { TodoInput } from "../../../domain/matters";
import { ChoiceField, RecordForm, TextField } from "../../notes";
import { useTodoForm } from "../use-todo-form";

/**
 * Adds a to-do or edits one (`todo` set), in one form (PBI-10); the state and rules are
 * `useTodoForm`. Waiting needs a reason and a follow-up date, dropping a reason; the matter is one
 * of the chosen community or none.
 */
const props = defineProps<{
  todo?: Todo | undefined;
  preset: Partial<TodoInput>;
  matters: readonly Matter[];
  communities: readonly { readonly value: string; readonly label: string }[];
  contacts: readonly Contact[];
  numbers: ReadonlyMap<string, string>;
}>();
const emit = defineEmits<{ done: [id: string]; cancel: [] }>();

const root = useTemplateRef<{ $el: HTMLElement }>("root");
const {
  form,
  t,
  matters: matterChoices,
  responsible,
  statuses,
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
} = useTodoForm({
  todo: props.todo,
  preset: props.preset,
  matters: () => props.matters,
  contacts: () => props.contacts,
  numbers: () => props.numbers,
  root: () => root.value?.$el,
  done: (id) => emit("done", id),
});
const communityChoices = [{ value: "", label: t.form.choose }, ...props.communities];
/** The choices beside the title, in file order. */
const choices = [
  { key: "community_id", options: () => communityChoices },
  { key: "matter_id", options: () => matterChoices.value },
  { key: "responsible", options: () => responsible.value },
  { key: "status", options: () => statuses },
] as const;
const dates = ["due_on", "follow_up_on"] as const;
</script>

<template>
  <RecordForm
    ref="root"
    form-id="todo-form"
    save-id="todo-save"
    :cancel="t.form.cancel"
    :save="t.form.save"
    v-bind="{ summary, notice, conflicts, pending, blocked, label, show }"
    @submit="submit"
    @apply="resolve"
    @cancel="emit('cancel')"
  >
    <form.Field name="title" :validators="validators('title')">
      <template #default="{ field }">
        <TextField
          :label="t.fields.title"
          :value="field.state.value"
          :error="errorOf('title', field.state.meta)"
          test-id="todo-title"
          required
          autofocus
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field
      v-for="item in choices"
      :key="item.key"
      :name="item.key"
      :validators="validators(item.key)"
    >
      <template #default="{ field }">
        <ChoiceField
          :label="t.fields[item.key]"
          :value="field.state.value"
          :options="item.options()"
          :error="errorOf(item.key, field.state.meta)"
          :test-id="`todo-${item.key}`"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <p class="wm:text-xs wm:text-muted">{{ t.form.statusHint }}</p>
    <div class="wm:grid wm:grid-cols-1 wm:gap-4 wm:sm:grid-cols-2">
      <form.Field v-for="key in dates" :key="key" :name="key" :validators="validators(key)">
        <template #default="{ field }">
          <TextField
            :label="t.fields[key]"
            :value="field.state.value"
            :error="errorOf(key, field.state.meta)"
            type="date"
            :test-id="`todo-${key}`"
            @change="field.handleChange"
            @blur="field.handleBlur"
          />
        </template>
      </form.Field>
    </div>
    <form.Field name="reason" :validators="validators('reason')">
      <template #default="{ field }">
        <TextField
          :label="t.fields.reason"
          :value="field.state.value"
          :error="errorOf('reason', field.state.meta)"
          test-id="todo-reason"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
  </RecordForm>
</template>
