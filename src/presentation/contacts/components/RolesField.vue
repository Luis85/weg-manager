<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { computed, useId } from "vue";
import { parseRole, roleEntry, type ContactRole } from "../../../domain/contacts";
import { useMessages } from "../../shell";
import RoleRow from "./RoleRow.vue";

/**
 * The roles of a contact (PBI-02 criterion 5): one row per community (`RoleRow`), and a button to
 * add a role in a community that has none yet. A community chosen in one row is not offered in
 * another, so there is one role per community.
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

/** Each entry as community and role; an entry the form cannot read starts empty. */
const rows = computed(() =>
  props.roles.map((entry) => parseRole(entry) ?? { community: "", role: "board" as ContactRole }),
);
const used = computed(() => new Set(rows.value.map((row) => row.community)));
const free = computed(() => props.communities.filter((community) => !used.value.has(community.id)));
/** The communities the row at `at` may choose: its own and the free ones. */
const choices = (community: string) =>
  props.communities.filter((option) => option.id === community || !used.value.has(option.id));
const hint = computed(() => {
  if (props.communities.length === 0) return t.form.noCommunities;
  return props.roles.length === 0 ? t.form.noRole : undefined;
});

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
</script>

<template>
  <fieldset class="wm:flex wm:flex-col wm:gap-2" data-testid="field-roles">
    <legend class="wm:mb-1 wm:text-sm wm:font-medium">{{ t.fields.roles }}</legend>
    <p v-if="hint" class="wm:text-sm wm:text-muted">{{ hint }}</p>
    <RoleRow
      v-for="(row, at) in rows"
      :key="`${row.community}-${at}`"
      :community="row.community"
      :role="row.role"
      :communities="choices(row.community)"
      :described-by="error ? errorId : undefined"
      @change="(community, role) => replace(at, community, role)"
      @remove="removeAt(at)"
      @blur="emit('blur')"
    />
    <div v-if="free.length > 0">
      <UButton
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
