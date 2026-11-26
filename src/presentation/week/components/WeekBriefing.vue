<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UFormField from "@nuxt/ui/components/FormField.vue";
import UTextarea from "@nuxt/ui/components/Textarea.vue";
import type { WeekNote } from "../../../application/week";
import type { Sentence } from "../../../domain/week";
import { ErrorNotice, useMessages } from "../../shell";
import { useBriefingForm } from "../use-week";

/**
 * The briefing of the week (PBI-13 criteria 1 and 4): the computed sentences, each naming its
 * records, and the board member's own text from the week note when there is one; both can be
 * edited and saved into the week note.
 */
const props = defineProps<{
  sentences: readonly Sentence[];
  sentenceText: (sentence: Sentence) => string;
  computedText: string;
  savedText: string | undefined;
  weekOf: string;
  week: WeekNote | undefined;
}>();
const emit = defineEmits<{ saved: [] }>();
const t = useMessages().week.briefing;
const { form, command, open, start } = useBriefingForm({
  weekOf: () => props.weekOf,
  week: () => props.week,
  loaded: () => props.savedText ?? "",
  done: () => emit("saved"),
});
</script>

<template>
  <section class="wm:flex wm:flex-col wm:gap-2" :aria-label="t.title" data-testid="week-briefing">
    <div class="wm:flex wm:items-center wm:justify-between wm:gap-2">
      <h3 class="wm:text-base wm:font-semibold">{{ t.title }}</h3>
      <UButton
        v-if="!open"
        type="button"
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-pencil"
        :label="t.edit"
        data-testid="briefing-edit"
        @click="start(savedText ?? computedText)"
      />
    </div>
    <div
      v-if="savedText !== undefined"
      class="wm:flex wm:flex-col wm:gap-1"
      data-testid="briefing-saved"
    >
      <p class="wm:text-xs wm:text-muted">{{ t.savedTitle }}</p>
      <p class="wm:text-sm wm:whitespace-pre-wrap wm:wrap-break-word">{{ savedText }}</p>
    </div>
    <p class="wm:text-xs wm:text-muted">{{ t.computedTitle }}</p>
    <ol
      class="wm:flex wm:list-decimal wm:flex-col wm:gap-1 wm:pl-5 wm:text-sm"
      data-testid="briefing-sentences"
    >
      <li v-for="sentence in sentences" :key="sentence.code" data-testid="briefing-sentence">
        {{ sentenceText(sentence) }}
      </li>
    </ol>
    <form
      v-if="open"
      class="wm:flex wm:flex-col wm:gap-2 wm:rounded-md wm:border wm:border-default wm:p-3"
      novalidate
      data-testid="briefing-form"
      @submit.prevent="form.handleSubmit()"
    >
      <form.Field name="text">
        <template #default="{ field }">
          <UFormField :label="t.editTitle" :help="t.hint">
            <UTextarea
              :model-value="field.state.value"
              :rows="8"
              class="wm:w-full"
              data-testid="briefing-text"
              @update:model-value="(next: string) => field.handleChange(next)"
            />
          </UFormField>
        </template>
      </form.Field>
      <ErrorNotice v-if="command.message.value" :message="command.message.value" />
      <div class="wm:flex wm:justify-end wm:gap-2">
        <UButton
          type="button"
          color="neutral"
          variant="ghost"
          :label="t.cancel"
          @click="open = false"
        />
        <UButton
          type="submit"
          :label="t.save"
          :loading="command.pending.value"
          data-testid="briefing-save"
        />
      </div>
    </form>
  </section>
</template>
