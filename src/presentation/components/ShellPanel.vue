<script setup lang="ts">
import UCard from "@nuxt/ui/components/Card.vue";
import USkeleton from "@nuxt/ui/components/Skeleton.vue";
import { computed, onMounted } from "vue";
import { countMarkdownFiles } from "../../application/use-cases";
import { useEffectAction, useSettings } from "../runtime/use-runtime";
import AboutDialog from "./AboutDialog.vue";
import ErrorNotice from "./ErrorNotice.vue";
import GreetingForm from "./GreetingForm.vue";

/** The walking-skeleton view: greeting from settings, a vault read, a form, a dialog. */
const settings = useSettings();
const count = useEffectAction(() => countMarkdownFiles);
const { pending, value: fileCount, message: countMessage } = count;
const recount = () => count.run();

const showError = computed(() => countMessage.value !== undefined && !pending.value);
const showCount = computed(
  () => !showError.value && fileCount.value !== undefined && !pending.value,
);
/** Counting, or not yet started: the region is busy until a count or an error arrives. */
const busy = computed(() => !showError.value && !showCount.value);
const countLabel = computed(() =>
  fileCount.value === 1
    ? "1 Markdown-Datei im Vault"
    : `${String(fileCount.value)} Markdown-Dateien im Vault`,
);

onMounted(recount);
</script>

<template>
  <UCard class="wm:m-3">
    <template #header>
      <div class="wm:flex wm:items-center wm:justify-between wm:gap-2">
        <h2 class="wm:text-base wm:font-semibold" data-testid="greeting">
          {{ settings.greeting }}
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
        <template v-else-if="busy">
          <USkeleton class="wm:h-5 wm:w-48" aria-hidden="true" data-testid="file-count-pending" />
          <span class="wm:sr-only">Zähle Notizen …</span>
        </template>
      </div>
      <GreetingForm />
    </div>
  </UCard>
</template>
