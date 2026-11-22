<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import USkeleton from "@nuxt/ui/components/Skeleton.vue";
import USlideover from "@nuxt/ui/components/Slideover.vue";
import { computed, shallowRef } from "vue";
import {
  COMMUNITIES_FOLDER,
  communityList,
  communityListChanges,
  type Community,
} from "../../../application/communities";
import {
  describeUnindexedIssue,
  rebuildNoteIndex,
  unindexedChanges,
  unindexedSnapshot,
} from "../../../application/notes";
import { describeError } from "../../../application/user-messages";
import { ErrorNotice, useCommand, useMessages, useSettings, useStream } from "../../shell";
import CommunityCard from "./CommunityCard.vue";
import CommunityForm from "./CommunityForm.vue";
import DeleteCommunityDialog from "./DeleteCommunityDialog.vue";

/**
 * The community settings (VIEW-07, route `settings/communities`): the communities from the note
 * index with their issues, create and edit in a sheet, delete with a confirmation, and the notes
 * the index could not assign to a type. It follows the index: a write shows once Obsidian has
 * indexed it.
 */
const catalog = useMessages();
const t = catalog.communities;
const settings = useSettings();
const list = useStream(communityList, communityListChanges);
const unindexed = useStream(unindexedSnapshot, unindexedChanges);
const rebuild = useCommand(() => rebuildNoteIndex);

/** The sheet: closed, a new community, or one being edited. */
const editing = shallowRef<{ readonly community: Community | undefined } | undefined>();
const deleting = shallowRef<Community | undefined>();
/** One dialog per community: a delete still running after a cancel lands in no other's. */
const deletingKey = computed(() => deleting.value?.path ?? "");

const folder = computed(() => `${settings.value.rootFolder}/${COMMUNITIES_FOLDER}`);
const loading = computed(() => !list.value.ready && list.value.failure === undefined);
const failure = computed(() =>
  list.value.failure === undefined ? undefined : describeError(list.value.failure, catalog),
);
const empty = computed(() => list.value.ready && list.value.communities.length === 0);
const sheetOpen = computed({
  get: () => editing.value !== undefined,
  set: (open: boolean) => {
    if (!open) editing.value = undefined;
  },
});
const sheetTitle = computed(() =>
  editing.value?.community === undefined ? t.form.createTitle : t.form.editTitle,
);
const create = () => {
  editing.value = { community: undefined };
};
const close = () => {
  editing.value = undefined;
};
</script>

<template>
  <div class="wm:m-3 wm:flex wm:flex-col wm:gap-4" data-testid="communities-screen">
    <header class="wm:flex wm:flex-wrap wm:items-start wm:justify-between wm:gap-2">
      <div class="wm:flex wm:flex-col wm:gap-1">
        <h2 class="wm:text-lg wm:font-semibold">{{ t.screen.title }}</h2>
        <p class="wm:text-sm wm:text-muted wm:wrap-break-word" data-testid="communities-intro">
          {{ t.screen.intro(folder) }}
        </p>
      </div>
      <UButton
        v-if="!empty"
        type="button"
        icon="i-lucide-plus"
        :label="t.screen.add"
        :disabled="!list.ready"
        data-testid="community-add"
        @click="create"
      />
    </header>
    <ErrorNotice
      v-if="failure"
      :message="failure"
      :handlers="{ retry: () => rebuild.run() }"
      data-testid="communities-failure"
    />
    <div v-if="loading" role="status" aria-busy="true" data-testid="communities-loading">
      <USkeleton class="wm:h-16 wm:w-full" aria-hidden="true" />
      <span class="wm:sr-only">{{ t.screen.loading }}</span>
    </div>
    <div
      v-else-if="empty"
      class="wm:flex wm:flex-col wm:items-start wm:gap-2"
      data-testid="communities-empty"
    >
      <p class="wm:text-sm">{{ t.screen.empty }}</p>
      <UButton
        type="button"
        icon="i-lucide-plus"
        :label="t.screen.add"
        data-testid="community-add"
        @click="create"
      />
    </div>
    <ul
      v-else-if="list.communities.length > 0"
      class="wm:flex wm:flex-col wm:gap-2"
      :aria-label="t.screen.title"
      data-testid="communities"
    >
      <CommunityCard
        v-for="community in list.communities"
        :key="community.path"
        :community="community"
        @edit="editing = { community }"
        @remove="deleting = community"
      />
    </ul>
    <section
      v-if="unindexed.notes.length > 0"
      class="wm:flex wm:flex-col wm:gap-2"
      data-testid="unindexed-notes"
    >
      <h3 class="wm:text-base wm:font-semibold">{{ t.screen.otherNotes }}</h3>
      <ul class="wm:flex wm:flex-col wm:gap-2">
        <li
          v-for="note in unindexed.notes"
          :key="note.path"
          class="wm:flex wm:flex-col wm:gap-0.5 wm:rounded-md wm:border wm:border-default wm:p-3"
        >
          <span class="wm:font-mono wm:text-sm wm:wrap-anywhere">{{ note.path }}</span>
          <span class="wm:text-sm wm:text-warning">
            {{ describeUnindexedIssue(note.issue, catalog.notes) }}
          </span>
        </li>
      </ul>
    </section>
    <USlideover v-model:open="sheetOpen" :title="sheetTitle">
      <template #body>
        <CommunityForm
          v-if="editing"
          :community="editing.community"
          :communities="list.communities"
          @done="close"
          @cancel="close"
        />
      </template>
    </USlideover>
    <DeleteCommunityDialog :key="deletingKey" :community="deleting" @close="deleting = undefined" />
  </div>
</template>
