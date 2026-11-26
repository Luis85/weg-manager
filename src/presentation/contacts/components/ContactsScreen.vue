<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import USkeleton from "@nuxt/ui/components/Skeleton.vue";
import { computed, shallowRef } from "vue";
import { communityList, communityListChanges } from "../../../application/communities";
import {
  contactList,
  contactListChanges,
  shownName,
  type Contact,
} from "../../../application/contacts";
import { contactType } from "../../../domain/contacts";
import { RecordSheet, cardKey, useRecordScreen } from "../../notes";
import { ErrorNotice, useMessages, useStream } from "../../shell";
import ContactCard from "./ContactCard.vue";
import ContactForm from "./ContactForm.vue";

/**
 * The contacts screen (VIEW-06, route `contacts`, PBI-02): people and companies from the note
 * index with their roles per community and their issues, create and edit in a sheet. Contacts are
 * never deleted: an inactive one is hidden until "show inactive" is on, and the list says how
 * many it hides. Loading, failure, the sheet and the focus after it are the notes module's record
 * screen (`useRecordScreen`); this is the layout.
 */
const t = useMessages().contacts;
const list = useStream(contactList, contactListChanges);
const communities = useStream(communityList, communityListChanges);
const root = shallowRef<HTMLElement>();
const screen = useRecordScreen({
  type: contactType,
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

const showInactive = shallowRef(false);
const shown = computed(() =>
  list.value.records.filter((contact) => showInactive.value || contact.values.inactive !== true),
);
const hidden = computed(() => list.value.records.length - shown.value.length);
const shortCodes = computed(
  () =>
    new Map(
      communities.value.records.flatMap((community) =>
        community.id === undefined
          ? []
          : [[community.id, community.values.short_code ?? "?"] as const],
      ),
    ),
);
const names = computed(
  () =>
    new Map(
      list.value.records.flatMap((contact) =>
        contact.id === undefined ? [] : [[contact.id, shownName(contact)] as const],
      ),
    ),
);
const peopleOf = (company: Contact): readonly string[] =>
  company.values.kind !== "company" || company.id === undefined
    ? []
    : list.value.records
        .filter((person) => person.values.organization_id === company.id)
        .map((person) => shownName(person));
const sheetTitle = computed(() =>
  editing.value?.record === undefined ? t.form.createTitle : t.form.editTitle,
);
</script>

<template>
  <div ref="root" class="wm:flex wm:flex-col wm:gap-4" data-testid="contacts-screen">
    <header class="wm:flex wm:flex-wrap wm:items-start wm:justify-between wm:gap-2">
      <div class="wm:flex wm:flex-col wm:gap-1">
        <h2 class="wm:text-lg wm:font-semibold">{{ t.screen.title }}</h2>
        <p class="wm:text-sm wm:text-muted wm:wrap-break-word" data-testid="contacts-intro">
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
        data-testid="contact-add"
        @click="create"
      />
    </header>
    <ErrorNotice
      v-if="failure"
      :message="failure"
      :handlers="{ retry: retry }"
      data-testid="contacts-failure"
    />
    <div
      v-if="loading && loadingShown"
      role="status"
      aria-busy="true"
      data-testid="contacts-loading"
    >
      <USkeleton class="wm:h-16 wm:w-full" aria-hidden="true" />
      <span class="wm:sr-only">{{ t.screen.loading }}</span>
    </div>
    <div
      v-if="empty"
      class="wm:flex wm:flex-col wm:items-start wm:gap-2"
      data-testid="contacts-empty"
    >
      <p class="wm:text-sm">{{ t.screen.empty }}</p>
      <UButton
        type="button"
        icon="i-lucide-plus"
        :label="t.screen.add"
        data-focus="add"
        data-testid="contact-add"
        @click="create"
      />
    </div>
    <template v-else-if="list.records.length > 0">
      <label class="wm:flex wm:items-center wm:gap-2 wm:text-sm">
        <input v-model="showInactive" type="checkbox" data-testid="show-inactive" />
        {{ t.screen.showInactive }}
      </label>
      <p
        v-if="hidden > 0"
        class="wm:text-xs wm:text-muted"
        role="status"
        data-testid="hidden-inactive"
      >
        {{ t.screen.hiddenInactive(hidden) }}
      </p>
      <ul class="wm:flex wm:flex-col wm:gap-2" :aria-label="t.screen.title" data-testid="contacts">
        <ContactCard
          v-for="contact in shown"
          :key="cardKey(contact)"
          :contact="contact"
          :communities="shortCodes"
          :names="names"
          :people="peopleOf(contact)"
          :data-card-key="cardKey(contact)"
          @edit="edit(contact)"
        />
      </ul>
    </template>
    <RecordSheet :title="sheetTitle" :state="screen">
      <template #body>
        <ContactForm
          v-if="editing"
          :contact="editing.record"
          :contacts="list.records"
          :communities="communities.records"
          @done="saved"
          @cancel="close"
        />
      </template>
    </RecordSheet>
  </div>
</template>
