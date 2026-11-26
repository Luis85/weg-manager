<script setup lang="ts">
import USkeleton from "@nuxt/ui/components/Skeleton.vue";
import { computed, shallowRef } from "vue";
import type { Contact } from "../../../application/contacts";
import { todoList, todoListChanges, type Matter } from "../../../application/matters";
import {
  clarificationList,
  todoGroup,
  todoType,
  type TodoGroup,
  type TodoInput,
} from "../../../domain/matters";
import { RecordSheet, cardKey, useRecordScreen } from "../../notes";
import { ErrorNotice, useMessages, useStream } from "../../shell";
import ClarificationList from "./ClarificationList.vue";
import TodoCard from "./TodoCard.vue";
import TodoForm from "./TodoForm.vue";
import TodoQuickAdd from "./TodoQuickAdd.vue";

/**
 * The to-dos segment of the matters screen (VIEW-03, PBI-10): the quick entry, the clarification
 * list, then the to-dos grouped Überfällig · Diese Woche · Später, the closed ones folded away.
 * The sheet edits a to-do or adds one for a matter of the clarification list.
 */
const props = defineProps<{
  matters: readonly Matter[];
  communities: readonly { readonly value: string; readonly label: string }[];
  contacts: readonly Contact[];
  contactNames: ReadonlyMap<string, string>;
  numbers: ReadonlyMap<string, string>;
  community: string | undefined;
  today: string;
}>();

const t = useMessages().matters.todos;
const list = useStream(todoList, todoListChanges);
const root = shallowRef<HTMLElement>();
const screen = useRecordScreen({ type: todoType, list: () => list.value, root: () => root.value });
const { folder, loading, loadingShown, failure, retry, editing, edit, saved, close } = screen;
/** What a new to-do from the clarification list starts with. */
const preset = shallowRef<Partial<TodoInput>>({});
const addFor = (matter: Matter) => {
  preset.value = {
    community_id: matter.values.community_id ?? "",
    matter_id: matter.id ?? "",
    title: matter.values.next_step ?? "",
  };
  screen.create();
};
const ORDER: readonly TodoGroup[] = ["overdue", "week", "later"];
const grouped = computed(() => {
  const groups = new Map<TodoGroup, typeof list.value.records>();
  for (const todo of list.value.records) {
    const group = todoGroup(todo.values, props.today);
    groups.set(group, [...(groups.get(group) ?? []), todo]);
  }
  return groups;
});
const shownGroups = computed(() =>
  ORDER.flatMap((group) => {
    const todos = grouped.value.get(group) ?? [];
    return todos.length === 0 ? [] : [{ group, todos }];
  }),
);
const closed = computed(() => grouped.value.get("closed") ?? []);
const unclear = computed(() => clarificationList(props.matters, list.value.records));
const loadingVisible = computed(() => loading.value && loadingShown.value);
const empty = computed(() => list.value.ready && list.value.records.length === 0);
const sheetTitle = computed(() =>
  editing.value?.record === undefined ? t.form.createTitle : t.form.editTitle,
);
</script>

<template>
  <div ref="root" class="wm:flex wm:flex-col wm:gap-4" data-testid="todos-screen">
    <p class="wm:text-sm wm:text-muted wm:wrap-break-word" data-testid="todos-intro">
      {{ t.intro(folder) }}
    </p>
    <ErrorNotice v-if="failure" :message="failure" :handlers="{ retry: retry }" />
    <div v-if="loadingVisible" role="status" aria-busy="true">
      <USkeleton class="wm:h-16 wm:w-full" aria-hidden="true" />
      <span class="wm:sr-only">{{ t.loading }}</span>
    </div>
    <TodoQuickAdd :communities="communities" :community="community" />
    <ClarificationList :matters="unclear" :numbers="numbers" @add="addFor" />
    <p v-if="empty" class="wm:text-sm" data-testid="todos-empty">
      {{ t.empty }}
    </p>
    <section
      v-for="part in shownGroups"
      :key="part.group"
      class="wm:flex wm:flex-col wm:gap-2"
      :aria-label="t.groups[part.group]"
      :data-testid="`todos-${part.group}`"
    >
      <h3 class="wm:text-base wm:font-semibold">{{ t.groups[part.group] }}</h3>
      <ul class="wm:flex wm:flex-col wm:gap-2">
        <TodoCard
          v-for="todo in part.todos"
          :key="cardKey(todo)"
          :todo="todo"
          :numbers="numbers"
          :contact-names="contactNames"
          :data-card-key="cardKey(todo)"
          @edit="edit(todo)"
        />
      </ul>
    </section>
    <details v-if="closed.length > 0" data-testid="todos-closed">
      <summary class="wm:cursor-pointer wm:text-sm wm:font-semibold">
        {{ t.groups.closed }} ({{ closed.length }})
      </summary>
      <ul class="wm:mt-2 wm:flex wm:flex-col wm:gap-2">
        <TodoCard
          v-for="todo in closed"
          :key="cardKey(todo)"
          :todo="todo"
          :numbers="numbers"
          :contact-names="contactNames"
          :data-card-key="cardKey(todo)"
          @edit="edit(todo)"
        />
      </ul>
    </details>
    <RecordSheet :title="sheetTitle" :state="screen">
      <template #body>
        <TodoForm
          v-if="editing"
          :todo="editing.record"
          :preset="preset"
          :matters="matters"
          :communities="communities"
          :contacts="contacts"
          :numbers="numbers"
          @done="saved"
          @cancel="close"
        />
      </template>
    </RecordSheet>
  </div>
</template>
