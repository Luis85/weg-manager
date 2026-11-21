<script setup lang="ts">
import UCard from "@nuxt/ui/components/Card.vue";
import USkeleton from "@nuxt/ui/components/Skeleton.vue";
import { computed, onMounted, onScopeDispose } from "vue";
import { changesMarkdownFiles } from "../../application/events";
import { greetingOf } from "../../application/i18n";
import { countMarkdownFiles } from "../../application/use-cases";
import { RECOUNT_DELAY_MS, debounce } from "../recount";
import { useAppEvents, useMessages, useQuery, useSettings } from "../runtime/use-runtime";
import AboutDialog from "./AboutDialog.vue";
import ErrorNotice from "./ErrorNotice.vue";
import GreetingForm from "./GreetingForm.vue";

/** The walking-skeleton view: greeting from settings, a vault read, a form, a dialog. */
const settings = useSettings();
const messages = useMessages();
const greeting = computed(() => greetingOf(settings.value, messages));
const count = useQuery(() => countMarkdownFiles);
const { pending, value: fileCount, message: countMessage } = count;
const recount = () => count.run();

const showError = computed(() => countMessage.value !== undefined && !pending.value);
/** A recount keeps the previous count visible; only the first count shows the skeleton. */
const showCount = computed(() => !showError.value && fileCount.value !== undefined);
/** No count or error yet: the skeleton stands in. */
const waiting = computed(() => !showError.value && !showCount.value);
/** Busy for screen readers while any count runs, including a recount. */
const busy = computed(() => waiting.value || pending.value);
const countLabel = computed(() => messages.panel.markdownFiles(fileCount.value ?? 0));

/**
 * Recount once a burst of vault changes adds, removes or renames Markdown files. The timer drops
 * the promise on purpose: `run` never rejects (failures land in `countMessage`).
 */
const later = debounce(() => void recount(), RECOUNT_DELAY_MS);
useAppEvents((event) => {
  if (changesMarkdownFiles(event)) later.trigger();
});
onScopeDispose(later.cancel);

onMounted(recount);
</script>

<template>
  <UCard class="wm:m-3">
    <template #header>
      <div class="wm:flex wm:items-center wm:justify-between wm:gap-2">
        <h2 class="wm:text-base wm:font-semibold" data-testid="greeting">
          {{ greeting }}
        </h2>
        <AboutDialog />
      </div>
    </template>
    <div class="wm:flex wm:flex-col wm:gap-4">
      <ErrorNotice
        v-if="showError && countMessage"
        :message="countMessage"
        :handlers="{ retry: recount }"
      />
      <div
        class="wm:empty:hidden"
        aria-live="polite"
        :aria-busy="busy ? 'true' : 'false'"
        data-testid="file-count-region"
      >
        <p v-if="showCount" data-testid="file-count">{{ countLabel }}</p>
        <template v-else-if="waiting">
          <USkeleton class="wm:h-5 wm:w-48" aria-hidden="true" data-testid="file-count-pending" />
          <span class="wm:sr-only">{{ messages.panel.counting }}</span>
        </template>
      </div>
      <GreetingForm />
    </div>
  </UCard>
</template>
