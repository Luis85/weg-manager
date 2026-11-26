<script setup lang="ts">
import { computed } from "vue";
import type { Briefing } from "../../../domain/week";
import { useMessages } from "../../shell";

/**
 * The deadlines of the next 14 days, overdue first, and the board's own open and waiting to-dos
 * (PBI-13 criterion 1), each with what it refers to.
 */
const props = defineProps<{
  briefing: Briefing;
  labels: ReadonlyMap<string, string>;
  outcomes: ReadonlyMap<string, string>;
}>();
const t = useMessages().week;
const deadlines = computed(() =>
  props.briefing.deadlines.map((deadline) => ({
    key: `${deadline.kind}-${deadline.id}`,
    day: deadline.day,
    state: deadline.state,
    label:
      deadline.kind === "matter"
        ? `${props.labels.get(deadline.id) ?? ""} ${props.outcomes.get(deadline.id) ?? ""}`.trim()
        : (props.labels.get(deadline.id) ?? deadline.id),
  })),
);
const STATE_CLASS = {
  overdue: "wm:text-error",
  acute: "wm:text-warning",
  soon: "wm:text-muted",
} as const;
const todos = computed(() =>
  props.briefing.todos.map((todo) => ({
    key: todo.id ?? "",
    label: props.labels.get(todo.id ?? "") ?? "",
    day: todo.values.status === "waiting" ? todo.values.follow_up_on : todo.values.due_on,
  })),
);
</script>

<template>
  <section
    class="wm:flex wm:flex-col wm:gap-1"
    :aria-label="t.deadlines.title"
    data-testid="week-deadlines"
  >
    <h3 class="wm:text-base wm:font-semibold">{{ t.deadlines.title }}</h3>
    <p v-if="deadlines.length === 0" class="wm:text-sm wm:text-muted">{{ t.deadlines.none }}</p>
    <ul v-else class="wm:flex wm:flex-col wm:gap-1 wm:text-sm">
      <li v-for="deadline in deadlines" :key="deadline.key" data-testid="week-deadline">
        <span class="wm:font-mono">{{ deadline.day }}</span> ·
        <span :class="STATE_CLASS[deadline.state]">{{ t.deadlines.states[deadline.state] }}</span>
        · {{ deadline.label }}
      </li>
    </ul>
  </section>
  <section
    class="wm:flex wm:flex-col wm:gap-1"
    :aria-label="t.todos.title"
    data-testid="week-todos"
  >
    <h3 class="wm:text-base wm:font-semibold">{{ t.todos.title }}</h3>
    <p v-if="todos.length === 0" class="wm:text-sm wm:text-muted">{{ t.todos.none }}</p>
    <ul v-else class="wm:flex wm:flex-col wm:gap-1 wm:text-sm">
      <li v-for="todo in todos" :key="todo.key" data-testid="week-todo">
        {{ todo.label
        }}<span v-if="todo.day" class="wm:font-mono wm:text-muted"> · {{ todo.day }}</span>
      </li>
    </ul>
  </section>
</template>
