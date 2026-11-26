<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { ChoiceField, TextField } from "../../notes";
import { useMessages } from "../../shell";
import { useQuickTodo } from "../use-todo-form";

/**
 * The quick entry of the to-dos (VIEW-03): what to do, the community (the selected one first) and
 * a due date; it adds an open to-do by the board and keeps the community for the next one.
 */
const props = defineProps<{
  communities: readonly { readonly value: string; readonly label: string }[];
  community: string | undefined;
}>();

const t = useMessages().matters.todos;
const { form, command, validators } = useQuickTodo(
  () => props.community ?? props.communities[0]?.value ?? "",
);
</script>

<template>
  <form
    class="wm:flex wm:flex-col wm:gap-2 wm:rounded-md wm:border wm:border-default wm:p-3"
    novalidate
    :aria-label="t.quick.label"
    data-testid="todo-quick"
    @submit.prevent="form.handleSubmit()"
  >
    <form.Field name="title" :validators="validators('title')">
      <template #default="{ field }">
        <TextField
          :label="t.quick.label"
          :help="t.quick.placeholder"
          :value="field.state.value"
          :error="field.state.meta.errors[0] ?? false"
          test-id="todo-quick-title"
          required
          @change="field.handleChange"
        />
      </template>
    </form.Field>
    <div class="wm:grid wm:grid-cols-1 wm:gap-2 wm:sm:grid-cols-2">
      <form.Field name="community_id" :validators="validators('community_id')">
        <template #default="{ field }">
          <ChoiceField
            :label="t.fields.community_id"
            :value="field.state.value"
            :options="communities"
            :error="field.state.meta.errors[0] ?? false"
            test-id="todo-quick-community"
            @change="field.handleChange"
          />
        </template>
      </form.Field>
      <form.Field name="due_on" :validators="validators('due_on')">
        <template #default="{ field }">
          <TextField
            :label="t.fields.due_on"
            :value="field.state.value"
            :error="field.state.meta.errors[0] ?? false"
            type="date"
            test-id="todo-quick-due"
            @change="field.handleChange"
          />
        </template>
      </form.Field>
    </div>
    <div>
      <UButton
        type="submit"
        icon="i-lucide-plus"
        :label="t.quick.add"
        :loading="command.pending.value"
        data-testid="todo-quick-add"
      />
    </div>
  </form>
</template>
