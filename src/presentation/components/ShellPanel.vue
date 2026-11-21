<script setup lang="ts">
import UCard from "@nuxt/ui/components/Card.vue";
import USkeleton from "@nuxt/ui/components/Skeleton.vue";
import { onMounted } from "vue";
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
        v-if="countMessage && !pending"
        :message="countMessage"
        :handlers="{ retry: recount }"
      />
      <p v-else-if="fileCount !== undefined && !pending" data-testid="file-count">
        {{ fileCount }} Markdown-Dateien im Vault
      </p>
      <USkeleton v-else class="wm:h-5 wm:w-48" data-testid="file-count-pending" />
      <GreetingForm />
    </div>
  </UCard>
</template>
