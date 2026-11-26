<script setup lang="ts">
import { computed } from "vue";
import { todoList, todoListChanges, type Matter } from "../../../application/matters";
import { useMessages, useStream } from "../../shell";

/** A matter's to-dos in its history panel (PBI-10): title and state, the list read-only. */
const props = defineProps<{ matter: Matter }>();
const t = useMessages().matters.todos;
const list = useStream(todoList, todoListChanges);
const todos = computed(() =>
  list.value.records.flatMap((todo) =>
    todo.values.matter_id !== undefined && todo.values.matter_id === props.matter.id
      ? [
          {
            key: todo.path,
            title: todo.values.title ?? todo.fileName,
            status: todo.values.status === undefined ? "" : t.statuses[todo.values.status],
          },
        ]
      : [],
  ),
);
</script>

<template>
  <section
    class="wm:flex wm:flex-col wm:gap-1"
    :aria-label="t.ofMatter.title"
    data-testid="matter-todos"
  >
    <h4 class="wm:text-sm wm:font-semibold">{{ t.ofMatter.title }}</h4>
    <p v-if="todos.length === 0" class="wm:text-sm wm:text-muted">{{ t.ofMatter.none }}</p>
    <ul v-else class="wm:flex wm:flex-col wm:gap-1 wm:text-sm">
      <li v-for="todo in todos" :key="todo.key" data-testid="matter-todo">
        {{ todo.title }} <span class="wm:text-muted">({{ todo.status }})</span>
      </li>
    </ul>
  </section>
</template>
