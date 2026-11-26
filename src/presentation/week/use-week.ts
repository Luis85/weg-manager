import { useForm } from "@tanstack/vue-form";
import { computed, shallowRef, watch } from "vue";
import { communityList, communityListChanges } from "../../application/communities";
import {
  matterList,
  matterListChanges,
  sourceList,
  sourceListChanges,
  todoList,
  todoListChanges,
} from "../../application/matters";
import { today, todayChanges } from "../../application/shell";
import { saveWeekText, weekList, weekListChanges, weekText } from "../../application/week";
import { shownNumber } from "../../domain/matters";
import { decisionSelection, weekBriefing, type Sentence } from "../../domain/week";
import { useCommand, useMessages, useQuery, useSettings, useStream } from "../shell";

/**
 * The week screen's state (PBI-13): the briefing computed from the records whenever they or the
 * day change, so it is current on opening and never stems from a background run (K-04); the
 * labels of the records it names; and this week's note with its saved text.
 */
export const useWeek = () => {
  const t = useMessages().week;
  const matters = useStream(matterList, matterListChanges);
  const todos = useStream(todoList, todoListChanges);
  const sources = useStream(sourceList, sourceListChanges);
  const communities = useStream(communityList, communityListChanges);
  const weeks = useStream(weekList, weekListChanges);
  const day = useStream(today, todayChanges);
  const settings = useSettings();
  /** When the screen computed the briefing first: shown, so nobody takes it for a background run. */
  const openedAt = new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
  const briefing = computed(() =>
    weekBriefing({
      today: day.value,
      weekStart: settings.value.weekStart,
      acuteDays: settings.value.acuteDays,
      matters: matters.value.records,
      todos: todos.value.records,
      sources: sources.value.records,
    }),
  );
  const codes = computed(
    () => new Map(communities.value.records.map((c) => [c.id ?? "", c.values.short_code])),
  );
  /** A matter's shown number ("AW 005") by id, or none without a number. */
  const numberOf = (matter: (typeof matters.value.records)[number]) => {
    const { number, community_id: community } = matter.values;
    if (number === undefined) return [];
    return [[matter.id ?? "", shownNumber(codes.value.get(community ?? ""), number)] as const];
  };
  /** Each record's label by id: a matter's shown number, a to-do's title, a source's subject. */
  const labels = computed(
    () =>
      new Map<string, string>([
        ...matters.value.records.flatMap(numberOf),
        ...todos.value.records.map(
          (todo) => [todo.id ?? "", todo.values.title ?? todo.fileName] as const,
        ),
        ...sources.value.records.map(
          (source) => [source.id ?? "", source.values.subject ?? source.fileName] as const,
        ),
      ]),
  );
  /** The decisions of the week (PBI-14): computed on opening, as the briefing is. */
  const selection = computed(() =>
    decisionSelection({
      today: day.value,
      weekStart: settings.value.weekStart,
      acuteDays: settings.value.acuteDays,
      budget: settings.value.weekDecisions,
      matters: matters.value.records,
    }),
  );
  /** A matter's next step by id, on its decision card. */
  const steps = computed(
    () =>
      new Map(
        matters.value.records.flatMap((m) =>
          m.values.next_step === undefined ? [] : [[m.id ?? "", m.values.next_step] as const],
        ),
      ),
  );
  /** A matter's outcome by id, beside its number in the deadlines. */
  const outcomes = computed(
    () => new Map(matters.value.records.map((m) => [m.id ?? "", m.values.outcome ?? m.fileName])),
  );
  const sentenceText = (sentence: Sentence) =>
    t.briefing.sentences[sentence.code](
      sentence.ids.length,
      sentence.ids
        .map((id) => labels.value.get(id) ?? id)
        .toSorted((a, b) => a.localeCompare(b, "de", { numeric: true }))
        .join(", "),
    );
  const computedText = computed(() => briefing.value.sentences.map(sentenceText).join("\n"));
  const note = computed(() =>
    weeks.value.records.find((week) => week.values.week_of === briefing.value.coverage.weekOf),
  );
  const saved = useQuery(weekText);
  watch(
    () => note.value?.frontmatter,
    () => {
      if (note.value !== undefined) void saved.run(note.value);
    },
    { immediate: true },
  );
  const savedText = computed(() =>
    note.value === undefined ? undefined : (saved.value.value ?? "").trim(),
  );
  return {
    t,
    briefing,
    selection,
    steps,
    labels,
    outcomes,
    sentenceText,
    computedText,
    note,
    savedText,
    reload: () => (note.value === undefined ? undefined : void saved.run(note.value)),
    openedAt,
    day,
    settings,
    ready: computed(() => matters.value.ready && todos.value.ready && weeks.value.ready),
  };
};

/**
 * The form that edits this week's briefing text (PBI-13 criterion 4): TanStack Form over the
 * text, prefilled with the saved text or the computed sentences; saving writes the week note.
 */
export const useBriefingForm = (options: {
  readonly weekOf: () => string;
  readonly week: () => Parameters<typeof saveWeekText>[0]["week"];
  readonly loaded: () => string;
  readonly done: () => void;
}) => {
  const command = useCommand(saveWeekText);
  const open = shallowRef(false);
  const form = useForm({
    defaultValues: { text: "" },
    onSubmit: async ({ value }) => {
      const outcome = await command.run({
        weekOf: options.weekOf(),
        week: options.week(),
        loaded: options.loaded(),
        text: value.text,
      });
      if (outcome._tag === "success") {
        open.value = false;
        options.done();
      }
    },
  });
  const start = (text: string) => {
    form.reset({ text });
    open.value = true;
  };
  return { form, command, open, start };
};
