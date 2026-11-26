<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { computed, onMounted, watch } from "vue";
import { openSourceFile, sourceFiles, sourceText, type Source } from "../../../application/matters";
import { isWebLink } from "../../../domain/matters";
import { ErrorNotice, useCommand, useMessages, useQuery } from "../../shell";

/**
 * One source of a matter (PBI-11 criterion 6): kind, subject, day and origin, the source link as
 * a link, the message text, and each original with its vault path: an image shown, any file
 * opened in Obsidian, a missing one marked. Read again whenever the note changes.
 */
const props = defineProps<{ source: Source }>();
const t = useMessages().matters.sources;
const files = useQuery(sourceFiles);
const text = useQuery(sourceText);
const open = useCommand(openSourceFile);
const load = () => {
  void files.run(props.source);
  void text.run(props.source);
};
onMounted(load);
watch(() => props.source.frontmatter, load);
const values = computed(() => props.source.values);
const head = computed(() =>
  [
    values.value.kind === undefined ? undefined : t.kinds[values.value.kind],
    values.value.received_on === undefined ? undefined : t.received(values.value.received_on),
    values.value.origin,
  ]
    .filter((part) => part !== undefined)
    .join(" · "),
);
const link = computed(() => values.value.link);
const web = computed(() => link.value !== undefined && isWebLink(link.value));
const body = computed(() => (text.value.value ?? "").trim());
</script>

<template>
  <li
    class="wm:flex wm:flex-col wm:gap-1 wm:border-l-2 wm:border-default wm:pl-2 wm:text-sm"
    data-testid="source"
  >
    <p class="wm:font-medium wm:wrap-break-word" data-testid="source-subject">
      {{ values.subject ?? source.fileName }}
    </p>
    <p class="wm:text-xs wm:text-muted">{{ head }}</p>
    <a
      v-if="web"
      :href="link"
      target="_blank"
      rel="noopener noreferrer"
      class="wm:text-xs wm:break-all"
      data-testid="source-link"
    >
      {{ link }}
    </a>
    <p v-else-if="link" class="wm:font-mono wm:text-xs wm:break-all">{{ link }}</p>
    <p class="wm:whitespace-pre-wrap wm:wrap-break-word" data-testid="source-body">
      {{ body === "" ? t.noText : body }}
    </p>
    <ul class="wm:flex wm:flex-col wm:gap-2">
      <li
        v-for="file in files.value.value ?? []"
        :key="file.path"
        class="wm:flex wm:flex-col wm:gap-1"
        data-testid="source-file"
      >
        <img
          v-if="file.image"
          :src="file.image"
          :alt="file.name"
          class="wm:max-h-48 wm:max-w-full wm:rounded-md wm:object-contain"
          data-testid="source-image"
        />
        <div class="wm:flex wm:flex-wrap wm:items-center wm:gap-2">
          <span class="wm:font-mono wm:text-xs wm:break-all">{{ file.path }}</span>
          <span
            v-if="file.missing"
            class="wm:text-xs wm:font-semibold wm:text-warning"
            data-testid="source-missing"
          >
            {{ t.missingFile }}
          </span>
          <UButton
            v-else
            type="button"
            size="xs"
            color="neutral"
            variant="outline"
            icon="i-lucide-external-link"
            :label="t.openFile"
            :aria-label="t.openFileLabel(file.name)"
            data-testid="source-open"
            @click="open.run(file.path)"
          />
        </div>
      </li>
    </ul>
    <ErrorNotice v-if="open.message.value" :message="open.message.value" />
  </li>
</template>
