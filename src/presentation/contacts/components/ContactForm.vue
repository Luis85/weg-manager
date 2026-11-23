<script setup lang="ts">
import UButton from "@nuxt/ui/components/Button.vue";
import UFormField from "@nuxt/ui/components/FormField.vue";
import UInput from "@nuxt/ui/components/Input.vue";
import { computed, useId, useTemplateRef } from "vue";
import type { Community } from "../../../application/communities";
import type { Contact } from "../../../application/contacts";
import { CONTACT_KINDS, CONTACT_LANGUAGES } from "../../../domain/contacts";
import { ConflictChoice } from "../../notes";
import { ErrorNotice } from "../../shell";
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

const root = useTemplateRef<HTMLFormElement>("root");
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
  root: () => root.value ?? undefined,
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
const ids = { kind: useId(), company: useId(), language: useId(), help: useId() };
</script>

<template>
  <form
    ref="root"
    class="wm:flex wm:min-h-full wm:flex-col"
    novalidate
    data-testid="contact-form"
    @submit.prevent="submit"
  >
    <div class="wm:flex wm:flex-1 wm:flex-col wm:gap-4 wm:p-4 wm:sm:p-6">
      <ErrorNotice v-if="summary" :message="summary" data-testid="form-summary" />
      <form.Field name="name" :validators="validators('name')">
        <template #default="{ field }">
          <UFormField
            :label="t.fields.name"
            :name="field.name"
            :error="errorOf('name', field.state.meta)"
          >
            <UInput
              :model-value="field.state.value"
              class="wm:w-full"
              aria-required="true"
              data-autofocus
              data-testid="field-name"
              @update:model-value="(next: string | number) => field.handleChange(String(next))"
              @blur="field.handleBlur"
            />
          </UFormField>
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
          <fieldset :aria-describedby="ids.kind" data-testid="field-kind">
            <legend class="wm:mb-1 wm:text-sm wm:font-medium">{{ t.fields.kind }}</legend>
            <div class="wm:flex wm:gap-4">
              <label
                v-for="kind in CONTACT_KINDS"
                :key="kind"
                class="wm:flex wm:items-center wm:gap-1 wm:text-sm"
              >
                <input
                  type="radio"
                  :name="ids.kind"
                  :value="kind"
                  :checked="field.state.value === kind"
                  :data-testid="`kind-${kind}`"
                  @change="field.handleChange(kind)"
                />
                {{ t.kinds[kind] }}
              </label>
            </div>
            <p
              v-if="errorOf('kind', field.state.meta)"
              :id="ids.kind"
              class="wm:text-sm wm:text-error"
            >
              {{ errorOf("kind", field.state.meta) }}
            </p>
          </fieldset>
        </template>
      </form.Field>
      <form.Field
        v-if="kindValue === 'person'"
        name="organization_id"
        :validators="validators('organization_id')"
      >
        <template #default="{ field }">
          <div class="wm:flex wm:flex-col wm:gap-1">
            <label :for="ids.company" class="wm:text-sm wm:font-medium">{{
              t.fields.organization_id
            }}</label>
            <select
              :id="ids.company"
              class="dropdown wm:w-full"
              :value="field.state.value"
              data-testid="field-organization_id"
              @change="(event) => field.handleChange((event.target as HTMLSelectElement).value)"
              @blur="field.handleBlur"
            >
              <option value="">{{ t.form.noCompany }}</option>
              <option v-for="company in companies" :key="company.id" :value="company.id">
                {{ company.name }}
              </option>
              <option :value="NEW_COMPANY">{{ t.form.newCompany }}</option>
            </select>
            <p v-if="errorOf('organization_id', field.state.meta)" class="wm:text-sm wm:text-error">
              {{ errorOf("organization_id", field.state.meta) }}
            </p>
          </div>
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
          <UFormField
            :label="t.fields.email"
            :name="field.name"
            :error="errorOf('email', field.state.meta)"
          >
            <UInput
              :model-value="field.state.value"
              type="email"
              class="wm:w-full"
              data-testid="field-email"
              @update:model-value="(next: string | number) => field.handleChange(String(next))"
              @blur="field.handleBlur"
            />
          </UFormField>
        </template>
      </form.Field>
      <form.Field name="phone" :validators="validators('phone')">
        <template #default="{ field }">
          <UFormField
            :label="t.fields.phone"
            :name="field.name"
            :error="errorOf('phone', field.state.meta)"
          >
            <UInput
              :model-value="field.state.value"
              type="tel"
              class="wm:w-full"
              data-testid="field-phone"
              @update:model-value="(next: string | number) => field.handleChange(String(next))"
              @blur="field.handleBlur"
            />
          </UFormField>
        </template>
      </form.Field>
      <form.Field name="language" :validators="validators('language')">
        <template #default="{ field }">
          <div class="wm:flex wm:flex-col wm:gap-1">
            <label :for="ids.language" class="wm:text-sm wm:font-medium">{{
              t.fields.language
            }}</label>
            <select
              :id="ids.language"
              class="dropdown wm:w-full"
              :value="field.state.value"
              data-testid="field-language"
              @change="(event) => field.handleChange((event.target as HTMLSelectElement).value)"
              @blur="field.handleBlur"
            >
              <option value="">{{ t.form.noLanguage }}</option>
              <option v-for="language in CONTACT_LANGUAGES" :key="language" :value="language">
                {{ t.languages[language] }}
              </option>
            </select>
            <p v-if="errorOf('language', field.state.meta)" class="wm:text-sm wm:text-error">
              {{ errorOf("language", field.state.meta) }}
            </p>
          </div>
        </template>
      </form.Field>
      <form.Field name="private" :validators="validators('private')">
        <template #default="{ field }">
          <div class="wm:flex wm:flex-col wm:gap-1">
            <label class="wm:flex wm:items-center wm:gap-2 wm:text-sm">
              <input
                type="checkbox"
                :checked="field.state.value || privateLocked"
                :aria-disabled="privateLocked ? 'true' : undefined"
                :aria-describedby="ids.help"
                data-testid="field-private"
                @click="(event) => privateLocked && event.preventDefault()"
                @change="(event) => field.handleChange((event.target as HTMLInputElement).checked)"
              />
              {{ t.fields.private }}
            </label>
            <p :id="ids.help" class="wm:text-xs wm:text-muted">
              {{ privateLocked ? t.form.privateLocked : t.form.privateHelp }}
            </p>
            <p v-if="errorOf('private', field.state.meta)" class="wm:text-sm wm:text-error">
              {{ errorOf("private", field.state.meta) }}
            </p>
          </div>
        </template>
      </form.Field>
      <form.Field name="inactive">
        <template #default="{ field }">
          <div class="wm:flex wm:flex-col wm:gap-1">
            <label class="wm:flex wm:items-center wm:gap-2 wm:text-sm">
              <input
                type="checkbox"
                :checked="field.state.value"
                data-testid="field-inactive"
                @change="(event) => field.handleChange((event.target as HTMLInputElement).checked)"
              />
              {{ t.fields.inactive }}
            </label>
            <p class="wm:text-xs wm:text-muted">{{ t.form.inactiveHelp }}</p>
          </div>
        </template>
      </form.Field>
      <ConflictChoice
        v-if="conflicts"
        :conflicts="conflicts"
        :disabled="pending"
        :label="label"
        :show="show"
        @apply="resolve"
      />
      <ErrorNotice v-if="notice" :message="notice" />
    </div>
    <div
      class="wm:sticky wm:bottom-0 wm:flex wm:flex-wrap wm:justify-end wm:gap-2 wm:border-t wm:border-default wm:bg-default wm:px-4 wm:py-3 wm:sm:px-6"
      data-testid="form-footer"
    >
      <UButton
        type="button"
        color="neutral"
        variant="outline"
        :label="t.form.cancel"
        @click="emit('cancel')"
      />
      <UButton
        type="submit"
        :label="t.form.save"
        :icon="pending ? 'i-lucide-loader-circle' : undefined"
        :ui="{ leadingIcon: pending ? 'wm:animate-spin' : '' }"
        :aria-disabled="blocked ? 'true' : undefined"
        :aria-busy="pending ? 'true' : undefined"
        class="wm:aria-disabled:cursor-not-allowed wm:aria-disabled:opacity-75"
        data-testid="contact-save"
      />
    </div>
  </form>
</template>
