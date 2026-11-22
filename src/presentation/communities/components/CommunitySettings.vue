<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import USkeleton from "@nuxt/ui/components/Skeleton.vue";
import USlideover from "@nuxt/ui/components/Slideover.vue";
import { computed, shallowRef } from "vue";
import {
  communityList,
  communityListChanges,
  communitySelection,
  communitySelectionChanges,
  deleteCommunity,
  shownName,
  type Community,
} from "../../../application/communities";
import { communityType } from "../../../domain/communities";
import { DeleteRecordDialog, OtherNotes, cardKey, useRecordScreen } from "../../notes";
import { ErrorNotice, useMessages, useStream } from "../../shell";
import CommunityCard from "./CommunityCard.vue";
import CommunityForm from "./CommunityForm.vue";

/**
 * The community settings (VIEW-07, route `settings/communities`): the communities from the note
 * index with their issues, the selected one marked, create and edit in a sheet, delete with a
 * confirmation, and the other WEG Manager notes the index could not assign to a type. It follows
 * the index: a write shows once Obsidian has indexed it. Loading, failure, the sheet, the dialog
 * and where the focus goes after them are the notes module's record screen (`useRecordScreen`);
 * this is the layout.
 */
const t = useMessages().communities;
const list = useStream(communityList, communityListChanges);
const selection = useStream(communitySelection, communitySelectionChanges);
const root = shallowRef<HTMLElement>();
const {
  folder,
  loading,
  loadingShown,
  failure,
  empty,
  retry,
  editing,
  deleting,
  deletingKey,
  sheetOpen,
  sheet,
  dialog,
  create,
  edit,
  saved,
  close,
  remove,
  removed,
  closeDelete,
} = useRecordScreen({ type: communityType, list: () => list.value, root: () => root.value });

const sheetTitle = computed(() =>
  editing.value?.record === undefined ? t.form.createTitle : t.form.editTitle,
);
const isSelected = (community: Community) =>
  community.id !== undefined && community.id === selection.value.id;
</script>

<template>
  <div ref="root" class="wm:m-3 wm:flex wm:flex-col wm:gap-4" data-testid="communities-screen">
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
        data-focus="add"
        data-testid="community-add"
        @click="create"
      />
    </header>
    <ErrorNotice
      v-if="failure"
      :message="failure"
      :handlers="{ retry: retry }"
      data-testid="communities-failure"
    />
    <div
      v-if="loading && loadingShown"
      role="status"
      aria-busy="true"
      data-testid="communities-loading"
    >
      <USkeleton class="wm:h-16 wm:w-full" aria-hidden="true" />
      <span class="wm:sr-only">{{ t.screen.loading }}</span>
    </div>
    <div
      v-if="empty"
      class="wm:flex wm:flex-col wm:items-start wm:gap-2"
      data-testid="communities-empty"
    >
      <p class="wm:text-sm">{{ t.screen.empty }}</p>
      <UButton
        type="button"
        icon="i-lucide-plus"
        :label="t.screen.add"
        data-focus="add"
        data-testid="community-add"
        @click="create"
      />
    </div>
    <ul
      v-else-if="list.records.length > 0"
      class="wm:flex wm:flex-col wm:gap-2"
      :aria-label="t.screen.title"
      data-testid="communities"
    >
      <CommunityCard
        v-for="community in list.records"
        :key="cardKey(community)"
        :community="community"
        :selected="isSelected(community)"
        :data-card-key="cardKey(community)"
        @edit="edit(community)"
        @remove="remove(community)"
      />
    </ul>
    <OtherNotes />
    <USlideover
      v-model:open="sheetOpen"
      :title="sheetTitle"
      :content="sheet"
      :ui="{ body: 'wm:p-0 wm:sm:p-0' }"
    >
      <template #body>
        <CommunityForm
          v-if="editing"
          :community="editing.record"
          :communities="list.records"
          @done="saved"
          @cancel="close"
        />
      </template>
    </USlideover>
    <DeleteRecordDialog
      :key="deletingKey"
      :record="deleting"
      :title="t.deletion.title"
      :name="deleting === undefined ? '' : shownName(deleting)"
      :remove="deleteCommunity"
      :content="dialog"
      @deleted="removed"
      @close="closeDelete"
    />
  </div>
</template>
