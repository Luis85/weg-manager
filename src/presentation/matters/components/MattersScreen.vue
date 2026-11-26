<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import USkeleton from "@nuxt/ui/components/Skeleton.vue";
import { computed, shallowRef } from "vue";
import {
  communityList,
  communityListChanges,
  communitySelection,
  communitySelectionChanges,
} from "../../../application/communities";
import {
  contactList,
  contactListChanges,
  shownName as contactName,
} from "../../../application/contacts";
import { matterList, matterListChanges } from "../../../application/matters";
import { today, todayChanges } from "../../../application/shell";
import { matchesFilter, matterType, shownNumber, type MatterFilter } from "../../../domain/matters";
import { RecordSheet, cardKey, useRecordScreen } from "../../notes";
import { ErrorNotice, useMessages, useStream } from "../../shell";
import MatterCard from "./MatterCard.vue";
import MatterFilters from "./MatterFilters.vue";
import MatterForm from "./MatterForm.vue";

/**
 * The matters screen (VIEW-03, route `matters`, PBI-05): every matter from the note index, newest
 * number first, with search and filters, the computed check mark and the issues; capture and edit
 * in a sheet. A new matter starts in the selected community. Loading, failure, the sheet and the
 * focus after it are the notes module's record screen (`useRecordScreen`); this is the layout.
 */
const t = useMessages().matters;
const list = useStream(matterList, matterListChanges);
const communities = useStream(communityList, communityListChanges);
const contacts = useStream(contactList, contactListChanges);
const selection = useStream(communitySelection, communitySelectionChanges);
const day = useStream(today, todayChanges);
const root = shallowRef<HTMLElement>();
const screen = useRecordScreen({
  type: matterType,
  list: () => list.value,
  root: () => root.value,
});
const {
  folder,
  loading,
  loadingShown,
  failure,
  empty,
  retry,
  editing,
  create,
  edit,
  saved,
  close,
} = screen;

const filter = shallowRef<MatterFilter>({});
const shown = computed(() =>
  list.value.records.filter((matter) => matchesFilter(matter.values, filter.value)),
);
const pairs = <R extends { readonly id: string | undefined }>(
  records: readonly R[],
  label: (record: R) => string,
) =>
  records.flatMap((record) =>
    record.id === undefined ? [] : [{ value: record.id, label: label(record) }],
  );
const communityChoices = computed(() =>
  pairs(communities.value.records, (c) => c.values.name ?? c.fileName),
);
const contactChoices = computed(() => pairs(contacts.value.records, contactName));
const shortCodes = computed(
  () => new Map(communities.value.records.map((c) => [c.id ?? "", c.values.short_code ?? "?"])),
);
const contactNames = computed(
  () => new Map(contactChoices.value.map((choice) => [choice.value, choice.label])),
);
const topics = computed(() =>
  [
    ...new Set(
      list.value.records.flatMap((m) => (m.values.topic === undefined ? [] : [m.values.topic])),
    ),
  ].toSorted((a, b) => a.localeCompare(b, "de")),
);
/** The shown number of each matter by id ("AW 041"). */
const numbers = computed(
  () =>
    new Map(
      list.value.records.flatMap((matter) => {
        const { number, community_id: community } = matter.values;
        if (matter.id === undefined || number === undefined) return [];
        const code = community === undefined ? undefined : shortCodes.value.get(community);
        return [[matter.id, shownNumber(code, number)] as const];
      }),
    ),
);
const sheetTitle = computed(() =>
  editing.value?.record === undefined ? t.form.createTitle : t.form.editTitle,
);
</script>

<template>
  <div ref="root" class="wm:flex wm:flex-col wm:gap-4" data-testid="matters-screen">
    <header class="wm:flex wm:flex-wrap wm:items-start wm:justify-between wm:gap-2">
      <div class="wm:flex wm:flex-col wm:gap-1">
        <h2 class="wm:text-lg wm:font-semibold">{{ t.screen.title }}</h2>
        <p class="wm:text-sm wm:text-muted wm:wrap-break-word" data-testid="matters-intro">
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
        data-testid="matter-add"
        @click="create"
      />
    </header>
    <ErrorNotice
      v-if="failure"
      :message="failure"
      :handlers="{ retry: retry }"
      data-testid="matters-failure"
    />
    <div
      v-if="loading && loadingShown"
      role="status"
      aria-busy="true"
      data-testid="matters-loading"
    >
      <USkeleton class="wm:h-16 wm:w-full" aria-hidden="true" />
      <span class="wm:sr-only">{{ t.screen.loading }}</span>
    </div>
    <div
      v-if="empty"
      class="wm:flex wm:flex-col wm:items-start wm:gap-2"
      data-testid="matters-empty"
    >
      <p class="wm:text-sm">{{ t.screen.empty }}</p>
      <UButton
        type="button"
        icon="i-lucide-plus"
        :label="t.screen.add"
        data-focus="add"
        data-testid="matter-add"
        @click="create"
      />
    </div>
    <template v-else-if="list.records.length > 0">
      <MatterFilters
        :filter="filter"
        :topics="topics"
        :communities="communityChoices"
        :responsible="contactChoices"
        @change="(next) => (filter = next)"
      />
      <p class="wm:text-xs wm:text-muted" role="status" data-testid="matters-shown">
        {{
          shown.length === 0 ? t.screen.noMatch : t.screen.shown(shown.length, list.records.length)
        }}
      </p>
      <ul class="wm:flex wm:flex-col wm:gap-2" :aria-label="t.screen.title" data-testid="matters">
        <MatterCard
          v-for="matter in shown"
          :key="cardKey(matter)"
          :matter="matter"
          :today="day"
          :short-codes="shortCodes"
          :contact-names="contactNames"
          :contacts="contactChoices"
          :matters="list.records"
          :numbers="numbers"
          :data-card-key="cardKey(matter)"
          @edit="edit(matter)"
        />
      </ul>
    </template>
    <RecordSheet :title="sheetTitle" :state="screen">
      <template #body>
        <MatterForm
          v-if="editing"
          :matter="editing.record"
          :matters="list.records"
          :communities="communities.records"
          :contacts="contacts.records"
          :community="selection.id"
          @done="saved"
          @cancel="close"
        />
      </template>
    </RecordSheet>
  </div>
</template>
