<script setup lang="ts">
import UFormField from "@nuxt/ui/components/FormField.vue";
import UInput from "@nuxt/ui/components/Input.vue";
import { computed, useId, useTemplateRef } from "vue";
import type { Community } from "../../../application/communities";
import type { Contact } from "../../../application/contacts";
import { CONTACT_KINDS, CONTACT_LANGUAGES } from "../../../domain/contacts";
import { ChoiceField, FlagField, RecordForm, TextField } from "../../notes";
import { NEW_COMPANY, useContactForm } from "../use-contact-form";
import RolesField from "./RolesField.vue";

/**
 * Creates a contact or edits one (`contact` set), in one form (PBI-02); the state and rules are
 * `useContactForm`. Name, kind and at least one role are required (`aria-required`). A person may
 * name a company, an existing one or a new one by name. An owner role keeps the private mark on:
 * the checkbox then says `aria-disabled` and ignores a click, never `disabled`, so it keeps the
 * focus. A failed submit puts a summary at the top and the focus on the first invalid field.
 */
const props = defineProps<{
  contact?: Contact | undefined;
  contacts: readonly Contact[];
  communities: readonly Community[];
}>();
const emit = defineEmits<{ done: [id: string]; cancel: [] }>();

const root = useTemplateRef<{ $el: HTMLElement }>("root");
const {
  form,
  t,
  companies,
  newCompany,
  rolesChanged,
  privateLocked,
  sameName,
  conflicts,
  validators,
  errorOf,
  submit,
  resolve,
  label,
  show,
  pending,
  blocked,
  summary,
  notice,
} = useContactForm({
  contact: props.contact,
  contacts: () => props.contacts,
  communities: () => props.communities,
  root: () => root.value?.$el,
  done: (id) => emit("done", id),
});
const kindValue = form.useSelector((state) => state.values.kind);
const companyValue = form.useSelector((state) => state.values.organization_id);
const communityOptions = computed(() =>
  props.communities.flatMap((community) =>
    community.id === undefined
      ? []
      : [
          {
            id: community.id,
            label: `${community.values.name ?? community.fileName} (${community.values.short_code ?? "?"})`,
          },
        ],
  ),
);
const companyOptions = computed(() => [
  { value: "", label: t.form.noCompany },
  ...companies.value.flatMap((company) =>
    company.id === undefined ? [] : [{ value: company.id, label: company.name }],
  ),
  { value: NEW_COMPANY, label: t.form.newCompany },
]);
const languageOptions = [
  { value: "", label: t.form.noLanguage },
  ...CONTACT_LANGUAGES.map((language) => ({ value: language, label: t.languages[language] })),
];
const kindGroup = useId();
</script>

<template>
  <RecordForm
    ref="root"
    form-id="contact-form"
    save-id="contact-save"
    :cancel="t.form.cancel"
    :save="t.form.save"
    :summary="summary"
    :notice="notice"
    :conflicts="conflicts"
    :pending="pending"
    :blocked="blocked"
    :label="label"
    :show="show"
    @submit="submit"
    @apply="resolve"
    @cancel="emit('cancel')"
  >
    <form.Field name="name" :validators="validators('name')">
      <template #default="{ field }">
        <TextField
          :label="t.fields.name"
          :value="field.state.value"
          :error="errorOf('name', field.state.meta)"
          test-id="field-name"
          required
          autofocus
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <p
      v-if="sameName.length > 0"
      class="wm:text-sm wm:text-warning"
      role="status"
      data-testid="same-name"
    >
      {{ t.form.sameName(sameName.join(", ")) }}
    </p>
    <form.Field name="kind" :validators="validators('kind')">
      <template #default="{ field }">
        <fieldset data-testid="field-kind">
          <legend class="wm:mb-1 wm:text-sm wm:font-medium">{{ t.fields.kind }}</legend>
          <div class="wm:flex wm:gap-4">
            <label
              v-for="kind in CONTACT_KINDS"
              :key="kind"
              class="wm:flex wm:items-center wm:gap-1 wm:text-sm"
            >
              <input
                type="radio"
                :name="kindGroup"
                :value="kind"
                :checked="field.state.value === kind"
                :data-testid="`kind-${kind}`"
                @change="field.handleChange(kind)"
              />
              {{ t.kinds[kind] }}
            </label>
          </div>
        </fieldset>
      </template>
    </form.Field>
    <form.Field
      v-if="kindValue === 'person'"
      name="organization_id"
      :validators="validators('organization_id')"
    >
      <template #default="{ field }">
        <ChoiceField
          :label="t.fields.organization_id"
          :value="field.state.value"
          :options="companyOptions"
          :error="errorOf('organization_id', field.state.meta)"
          test-id="field-organization_id"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <UFormField
      v-if="kindValue === 'person' && companyValue === NEW_COMPANY"
      :label="t.form.newCompanyName"
      :help="t.form.newCompanyHint"
    >
      <UInput v-model="newCompany" class="wm:w-full" data-testid="field-new-company" />
    </UFormField>
    <form.Field name="roles" :validators="validators('roles')">
      <template #default="{ field }">
        <RolesField
          :roles="field.state.value"
          :communities="communityOptions"
          :error="errorOf('roles', field.state.meta)"
          @change="(roles) => rolesChanged(roles, field.handleChange)"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="email" :validators="validators('email')">
      <template #default="{ field }">
        <TextField
          :label="t.fields.email"
          :value="field.state.value"
          :error="errorOf('email', field.state.meta)"
          type="email"
          test-id="field-email"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="phone" :validators="validators('phone')">
      <template #default="{ field }">
        <TextField
          :label="t.fields.phone"
          :value="field.state.value"
          :error="errorOf('phone', field.state.meta)"
          type="tel"
          test-id="field-phone"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="language" :validators="validators('language')">
      <template #default="{ field }">
        <ChoiceField
          :label="t.fields.language"
          :value="field.state.value"
          :options="languageOptions"
          :error="errorOf('language', field.state.meta)"
          test-id="field-language"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="private" :validators="validators('private')">
      <template #default="{ field }">
        <FlagField
          :label="t.fields.private"
          :checked="field.state.value"
          :locked="privateLocked"
          :help="privateLocked ? t.form.privateLocked : t.form.privateHelp"
          :error="errorOf('private', field.state.meta)"
          test-id="field-private"
          @change="field.handleChange"
        />
      </template>
    </form.Field>
    <form.Field name="inactive">
      <template #default="{ field }">
        <FlagField
          :label="t.fields.inactive"
          :checked="field.state.value"
          :help="t.form.inactiveHelp"
          :error="false"
          test-id="field-inactive"
          @change="field.handleChange"
        />
      </template>
    </form.Field>
  </RecordForm>
</template>
