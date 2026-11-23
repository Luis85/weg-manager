<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { computed, useId } from "vue";
import { CONTACT_ROLES, parseRole, roleEntry, type ContactRole } from "../../../domain/contacts";
import { useMessages } from "../../shell";

/**
 * The roles of a contact (PBI-02 criterion 5): one row per community, each a choice of the
 * community and of the role, with a button to remove it, and a button to add a role in a community
 * that has none yet. A community chosen in one row is not offered in another, so there is one role
 * per community. Native `select`s, so Obsidian styles them and every screen reader knows them.
 */
const props = defineProps<{
  roles: readonly string[];
  /** The communities a role may name, with the label each shows (name and short code). */
  communities: readonly { readonly id: string; readonly label: string }[];
  /** The field's issue, shown below it and named by each control. */
  error: string | false;
}>();
const emit = defineEmits<{ change: [roles: readonly string[]]; blur: [] }>();

const t = useMessages().contacts;
const errorId = useId();
const rowId = useId();

/** Each entry as community and role; an entry the form cannot read keeps its text. */
const rows = computed(() =>
  props.roles.map((entry) => parseRole(entry) ?? { community: "", role: "board" as ContactRole }),
);
const used = computed(() => new Set(rows.value.map((row) => row.community)));
const free = computed(() => props.communities.filter((community) => !used.value.has(community.id)));
const labelOf = (id: string) =>
  props.communities.find((community) => community.id === id)?.label ?? id;

const replace = (at: number, community: string, role: ContactRole) =>
  emit(
    "change",
    rows.value.map((row, index) =>
      index === at ? roleEntry(community, role) : roleEntry(row.community, row.role),
    ),
  );
const add = () => {
  const first = free.value[0];
  if (first !== undefined) emit("change", [...props.roles, roleEntry(first.id, "board")]);
};
const removeAt = (at: number) =>
  emit(
    "change",
    props.roles.filter((_, index) => index !== at),
  );
const describedBy = computed(() => (props.error ? errorId : undefined));
</script>

<template>
  <fieldset class="wm:flex wm:flex-col wm:gap-2" data-testid="field-roles">
    <legend class="wm:mb-1 wm:text-sm wm:font-medium">{{ t.fields.roles }}</legend>
    <p v-if="communities.length === 0" class="wm:text-sm wm:text-muted">
      {{ t.form.noCommunities }}
    </p>
    <p v-else-if="roles.length === 0" class="wm:text-sm wm:text-muted">{{ t.form.noRole }}</p>
    <div
      v-for="(row, at) in rows"
      :key="`${row.community}-${at}`"
      class="wm:flex wm:flex-wrap wm:items-end wm:gap-2"
      data-testid="role-row"
    >
      <label class="wm:flex wm:min-w-40 wm:flex-1 wm:flex-col wm:gap-1 wm:text-xs">
        {{ t.form.community }}
        <select
          :id="`${rowId}-c${at}`"
          class="dropdown wm:w-full"
          :value="row.community"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="describedBy"
          data-testid="role-community"
          @change="(event) => replace(at, (event.target as HTMLSelectElement).value, row.role)"
          @blur="emit('blur')"
        >
          <option
            v-for="community in communities.filter(
              (c) => c.id === row.community || !used.has(c.id),
            )"
            :key="community.id"
            :value="community.id"
          >
            {{ community.label }}
          </option>
          <option v-if="!communities.some((c) => c.id === row.community)" :value="row.community">
            {{ row.community }}
          </option>
        </select>
      </label>
      <label class="wm:flex wm:min-w-36 wm:flex-1 wm:flex-col wm:gap-1 wm:text-xs">
        {{ t.form.role }}
        <select
          class="dropdown wm:w-full"
          :value="row.role"
          :aria-describedby="describedBy"
          data-testid="role-role"
          @change="
            (event) =>
              replace(at, row.community, (event.target as HTMLSelectElement).value as ContactRole)
          "
          @blur="emit('blur')"
        >
          <option v-for="role in CONTACT_ROLES" :key="role" :value="role">
            {{ t.roles[role] }}
          </option>
        </select>
      </label>
      <UButton
        type="button"
        size="sm"
        color="neutral"
        variant="ghost"
        icon="i-lucide-x"
        :aria-label="t.form.removeRole(labelOf(row.community))"
        data-testid="role-remove"
        @click="removeAt(at)"
      />
    </div>
    <div>
      <UButton
        v-if="free.length > 0"
        type="button"
        size="sm"
        color="neutral"
        variant="outline"
        icon="i-lucide-plus"
        :label="t.form.addRole"
        data-testid="role-add"
        @click="add"
      />
    </div>
    <p v-if="error" :id="errorId" class="wm:text-sm wm:text-error" data-testid="roles-error">
      {{ error }}
    </p>
  </fieldset>
</template>
