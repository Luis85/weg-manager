<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UIcon from "@nuxt/ui/components/Icon.vue";
import { computed } from "vue";
import { describeContactIssue, shownName, type Contact } from "../../../application/contacts";
import { parseRole } from "../../../domain/contacts";
import { OpenNoteButton } from "../../notes";
import { useMessages } from "../../shell";

/**
 * One contact in the list (VIEW-06): name, kind, its roles per community (by short code), a
 * person's company or a company's people, the private and inactive marks in words with an icon,
 * and its issues as text. An editable note offers edit; a read-only one says so and offers to
 * open the note in Obsidian. Contacts are never deleted (owner decision 23.11.2026).
 */
const props = defineProps<{
  contact: Contact;
  /** Short code of each community by id; a missing one shows the id. */
  communities: ReadonlyMap<string, string>;
  /** The shown name of each contact by id: a person's company. */
  names: ReadonlyMap<string, string>;
  /** The people of a company, by name. */
  people: readonly string[];
}>();
const emit = defineEmits<{ edit: [] }>();

const catalog = useMessages();
const t = catalog.contacts;
const name = computed(() => shownName(props.contact));
const roles = computed(() =>
  (props.contact.values.roles ?? []).flatMap((entry) => {
    const role = parseRole(entry);
    if (role === undefined) return [];
    const community = props.communities.get(role.community) ?? role.community;
    return [t.screen.roleIn(t.roles[role.role], community)];
  }),
);
/** Kind, a person's company and a company's people, in one line. */
const summary = computed(() => {
  const { kind, organization_id: company } = props.contact.values;
  return [
    kind === undefined ? undefined : t.kinds[kind],
    company === undefined ? undefined : t.screen.worksFor(props.names.get(company) ?? company),
    props.people.length === 0 ? undefined : t.screen.people(props.people.join(", ")),
  ]
    .filter((part) => part !== undefined)
    .join(" · ");
});
/** The marks of the contact, each in words with its icon. */
const marks = computed(() =>
  [
    {
      show: props.contact.values.private === true,
      icon: "i-lucide-shield",
      text: t.screen.private,
      id: "contact-private",
    },
    {
      show: props.contact.values.inactive === true,
      icon: "i-lucide-archive",
      text: t.screen.inactive,
      id: "contact-inactive",
    },
    {
      show: !props.contact.editable,
      icon: "i-lucide-lock",
      text: t.screen.readOnly,
      id: "contact-read-only",
    },
  ].filter((mark) => mark.show),
);
const issues = computed(() =>
  props.contact.issues.map((issue) => describeContactIssue(issue, catalog)),
);
</script>

<template>
  <li
    class="wm:flex wm:flex-wrap wm:items-start wm:gap-3 wm:rounded-md wm:border wm:border-default wm:p-3"
    data-testid="contact"
  >
    <div class="wm:flex wm:min-w-40 wm:flex-1 wm:flex-col wm:gap-1">
      <h3
        class="wm:text-base wm:font-semibold wm:wrap-break-word wm:hyphens-auto"
        tabindex="-1"
        data-focus="name"
        data-testid="contact-name"
      >
        {{ name }}
      </h3>
      <p class="wm:text-sm wm:text-muted wm:wrap-break-word" data-testid="contact-summary">
        {{ summary }}
      </p>
      <ul v-if="roles.length > 0" class="wm:flex wm:flex-wrap wm:gap-1" data-testid="contact-roles">
        <li
          v-for="role in roles"
          :key="role"
          class="wm:rounded wm:border wm:border-default wm:px-1.5 wm:text-xs"
        >
          {{ role }}
        </li>
      </ul>
      <p v-if="marks.length > 0" class="wm:flex wm:flex-wrap wm:gap-3 wm:text-xs wm:text-muted">
        <span
          v-for="mark in marks"
          :key="mark.id"
          class="wm:flex wm:items-center wm:gap-1"
          :data-testid="mark.id"
        >
          <UIcon :name="mark.icon" class="wm:size-3.5" aria-hidden="true" />
          {{ mark.text }}
        </span>
      </p>
      <ul
        v-if="issues.length > 0"
        class="wm:flex wm:flex-col wm:gap-1 wm:text-sm wm:text-warning"
        data-testid="contact-issues"
      >
        <li v-for="issue in issues" :key="issue">{{ issue }}</li>
      </ul>
    </div>
    <OpenNoteButton v-if="!contact.editable" :path="contact.path" :name="name" />
    <UButton
      v-if="contact.editable"
      type="button"
      size="sm"
      color="neutral"
      variant="outline"
      icon="i-lucide-pencil"
      :label="t.screen.edit"
      :aria-label="t.screen.editLabel(name)"
      data-focus="edit"
      data-testid="contact-edit"
      @click="emit('edit')"
    />
  </li>
</template>
