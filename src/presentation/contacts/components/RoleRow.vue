<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import { computed } from "vue";
import { CONTACT_ROLES, type ContactRole } from "../../../domain/contacts";
import { useMessages } from "../../shell";

/**
 * One role of a contact: the community and the role as native `select`s, and a button to remove
 * it. `communities` holds the ones this row may choose; a community that no longer exists stays
 * as an option of its own, so the row shows what the note says.
 */
const props = defineProps<{
  community: string;
  role: ContactRole;
  communities: readonly { readonly id: string; readonly label: string }[];
  /** The roles field's issue, which both selects name. */
  describedBy: string | undefined;
}>();
const emit = defineEmits<{
  change: [community: string, role: ContactRole];
  remove: [];
  blur: [];
}>();

const t = useMessages().contacts;
const options = computed(() =>
  props.communities.some((option) => option.id === props.community)
    ? props.communities
    : [...props.communities, { id: props.community, label: props.community }],
);
const label = computed(
  () => options.value.find((option) => option.id === props.community)?.label ?? props.community,
);
const value = (event: Event) => (event.target as HTMLSelectElement).value;
</script>

<template>
  <div class="wm:flex wm:flex-wrap wm:items-end wm:gap-2" data-testid="role-row">
    <label class="wm:flex wm:min-w-40 wm:flex-1 wm:flex-col wm:gap-1 wm:text-xs">
      {{ t.form.community }}
      <select
        class="dropdown wm:w-full"
        :value="community"
        :aria-describedby="describedBy"
        data-testid="role-community"
        @change="(event) => emit('change', value(event), role)"
        @blur="emit('blur')"
      >
        <option v-for="option in options" :key="option.id" :value="option.id">
          {{ option.label }}
        </option>
      </select>
    </label>
    <label class="wm:flex wm:min-w-36 wm:flex-1 wm:flex-col wm:gap-1 wm:text-xs">
      {{ t.form.role }}
      <select
        class="dropdown wm:w-full"
        :value="role"
        :aria-describedby="describedBy"
        data-testid="role-role"
        @change="(event) => emit('change', community, value(event) as ContactRole)"
        @blur="emit('blur')"
      >
        <option v-for="option in CONTACT_ROLES" :key="option" :value="option">
          {{ t.roles[option] }}
        </option>
      </select>
    </label>
    <UButton
      type="button"
      size="sm"
      color="neutral"
      variant="ghost"
      icon="i-lucide-x"
      :aria-label="t.form.removeRole(label)"
      data-testid="role-remove"
      @click="emit('remove')"
    />
  </div>
</template>
