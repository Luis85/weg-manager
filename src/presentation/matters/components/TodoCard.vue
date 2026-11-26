<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { computed } from "vue";
import { completeTodo, describeTodoIssue, type Todo } from "../../../application/matters";
import { BOARD_ACTOR } from "../../../domain/matters";
import { useCommand, useMessages } from "../../shell";

/**
 * One to-do in the list (PBI-10): its title, state, matter, next date, who and the reason; done in
 * one step while it is open or waiting, which never touches its matter (criterion 3).
 */
const props = defineProps<{
  todo: Todo;
  numbers: ReadonlyMap<string, string>;
  contactNames: ReadonlyMap<string, string>;
}>();
const emit = defineEmits<{ edit: [] }>();

const catalog = useMessages();
const t = catalog.matters.todos;
const complete = useCommand(completeTodo);
const values = computed(() => props.todo.values);
const title = computed(() => values.value.title ?? props.todo.fileName);
const open = computed(() => values.value.status === "open" || values.value.status === "waiting");
/** `format` of `value`, or nothing while it is unset. */
const optional = <V,>(value: V | undefined, format: (value: V) => string) =>
  value === undefined ? undefined : format(value);
/** Who does the to-do, by name; the board by default. */
const who = (responsible: string | undefined) =>
  responsible === undefined || responsible === BOARD_ACTOR
    ? t.board
    : (props.contactNames.get(responsible) ?? responsible);
/** The line under the title: state, matter, next date, who, reason. */
const facts = computed(() => {
  const { status, matter_id: matter, due_on, follow_up_on, responsible, reason } = values.value;
  return [
    optional(status, (value) => t.statuses[value]),
    optional(matter, (id) => props.numbers.get(id) ?? id) ?? t.noMatter,
    optional(due_on, t.due),
    optional(follow_up_on, t.followUp),
    t.responsible(who(responsible)),
    optional(reason, t.reason),
  ]
    .filter((part) => part !== undefined)
    .join(" · ");
});
const issues = computed(() => props.todo.issues.map((issue) => describeTodoIssue(issue, catalog)));
</script>

<template>
  <li
    class="wm:flex wm:flex-wrap wm:items-start wm:gap-2 wm:rounded-md wm:border wm:border-default wm:p-3"
    data-testid="todo"
  >
    <div class="wm:flex wm:min-w-40 wm:flex-1 wm:flex-col wm:gap-1">
      <h3
        class="wm:text-sm wm:font-semibold wm:wrap-break-word"
        tabindex="-1"
        data-focus="name"
        data-testid="todo-name"
      >
        {{ title }}
      </h3>
      <p class="wm:text-xs wm:text-muted wm:wrap-break-word" data-testid="todo-facts">
        {{ facts }}
      </p>
      <p v-for="issue in issues" :key="issue" class="wm:text-sm wm:text-warning">{{ issue }}</p>
    </div>
    <UButton
      v-if="open && todo.editable && todo.issues.length === 0"
      type="button"
      size="sm"
      color="neutral"
      variant="outline"
      icon="i-lucide-check"
      :label="t.done"
      :aria-label="t.doneLabel(title)"
      :loading="complete.pending.value"
      data-testid="todo-done"
      @click="complete.run(todo)"
    />
    <UButton
      v-if="todo.editable"
      type="button"
      size="sm"
      color="neutral"
      variant="ghost"
      icon="i-lucide-pencil"
      :label="t.edit"
      :aria-label="t.editLabel(title)"
      data-focus="edit"
      data-testid="todo-edit"
      @click="emit('edit')"
    />
  </li>
</template>
