<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import USkeleton from "@nuxt/ui/components/Skeleton.vue";
import USlideover from "@nuxt/ui/components/Slideover.vue";
import { computed, shallowRef } from "vue";
import {
  COMMUNITIES_FOLDER,
  communityList,
  communityListChanges,
  communitySelection,
  communitySelectionChanges,
  type Community,
} from "../../../application/communities";
import { rebuildNoteIndex } from "../../../application/notes";
import { describeError } from "../../../application/user-messages";
import {
  ErrorNotice,
  useCommand,
  useDelayed,
  useMessages,
  useModal,
  useSettings,
  useStream,
} from "../../shell";
import { cardKey, useFocusAfter } from "../focus-after";
import CommunityCard from "./CommunityCard.vue";
import CommunityForm from "./CommunityForm.vue";
import DeleteCommunityDialog from "./DeleteCommunityDialog.vue";
import OtherNotes from "./OtherNotes.vue";

/**
 * The community settings (VIEW-07, route `settings/communities`): the communities from the note
 * index with their issues, the selected one marked, create and edit in a sheet, delete with a
 * confirmation, and the other WEG Manager notes the index could not assign to a type. It follows
 * the index: a write shows once Obsidian has indexed it. Loading shows after 300 ms. The sheet and
 * the dialog are modal (`useModal`); when one closes, the focus goes to the card it was about,
 * once the list shows it, or after a delete to "Gemeinschaft anlegen" (`useFocusAfter`).
 */
const catalog = useMessages();
const t = catalog.communities;
const settings = useSettings();
const list = useStream(communityList, communityListChanges);
const selection = useStream(communitySelection, communitySelectionChanges);
const rebuild = useCommand(() => rebuildNoteIndex);
const screen = shallowRef<HTMLElement>();
const focus = useFocusAfter(
  () => screen.value,
  () => list.value.communities,
);

/** The sheet: closed, a new community, or one being edited. */
const editing = shallowRef<{ readonly community: Community | undefined } | undefined>();
const deleting = shallowRef<Community | undefined>();
/** One dialog per community: a delete still running after a cancel lands in no other's. */
const deletingKey = computed(() => deleting.value?.path ?? "");

const folder = computed(() => `${settings.value.rootFolder}/${COMMUNITIES_FOLDER}`);
const loading = computed(() => !list.value.ready && list.value.failure === undefined);
const loadingShown = useDelayed(() => loading.value);
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
const sheet = useModal(() => sheetOpen.value, focus.closed);
const dialog = useModal(() => deleting.value !== undefined, focus.closed);

const create = () => {
  focus.opened({ add: true });
  editing.value = { community: undefined };
};
const edit = (community: Community) => {
  focus.opened({ card: cardKey(community) });
  editing.value = { community };
};
const saved = (id: string) => {
  focus.after({ card: `id:${id}` });
  editing.value = undefined;
};
const remove = (community: Community) => {
  focus.opened({ card: cardKey(community), control: "community-remove" });
  deleting.value = community;
};
const removed = () => {
  if (deleting.value !== undefined) focus.after({ add: true, gone: cardKey(deleting.value) });
};
const isSelected = (community: Community) =>
  community.id !== undefined && community.id === selection.value.id;
const close = () => {
  editing.value = undefined;
};
</script>

<template>
  <div ref="screen" class="wm:m-3 wm:flex wm:flex-col wm:gap-4" data-testid="communities-screen">
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
          :community="editing.community"
          :communities="list.communities"
          @done="saved"
          @cancel="close"
        />
      </template>
    </USlideover>
    <DeleteCommunityDialog
      :key="deletingKey"
      :community="deleting"
      :content="dialog"
      @deleted="removed"
      @close="deleting = undefined"
    />
  </div>
</template>
