<script setup lang="ts">
import UFormField from "@nuxt/ui/components/FormField.vue";
import UTextarea from "@nuxt/ui/components/Textarea.vue";
import { useId } from "vue";
import type { Matter } from "../../../application/matters";
import { ChoiceField, TextField } from "../../notes";
import { useSourceForm } from "../use-source-form";
import PanelFormFooter from "./PanelFormFooter.vue";

/**
 * Captures a source for a matter (PBI-11): subject, kind, day, origin, message id, link, the
 * message text or conversation note, and the originals, picked from anywhere; copied by default,
 * moved on the desktop if chosen. The vault paths they get show before saving.
 */
const props = defineProps<{ matter: Matter; today: string }>();
const emit = defineEmits<{ done: []; cancel: [] }>();

const { t, form, command, validators, kinds, files, pick, canMoveFiles, targets } = useSourceForm(
  () => props.matter,
  props.today,
  () => emit("done"),
);
const pickId = useId();
/** The text fields in file order: key, input type, help. */
const texts = [
  { key: "subject", type: "text", help: undefined, required: true },
  { key: "received_on", type: "date", help: undefined, required: false },
  { key: "origin", type: "text", help: t.form.originHint, required: true },
  { key: "message_ref", type: "text", help: undefined, required: false },
  { key: "link", type: "text", help: t.form.linkHint, required: false },
] as const;
</script>

<template>
  <form
    class="wm:flex wm:flex-col wm:gap-3 wm:rounded-md wm:border wm:border-default wm:p-3"
    novalidate
    data-testid="source-form"
    @submit.prevent="form.handleSubmit()"
  >
    <h4 class="wm:text-sm wm:font-semibold">{{ t.form.title }}</h4>
    <form.Field name="kind" :validators="validators('kind')">
      <template #default="{ field }">
        <ChoiceField
          :label="t.fields.kind"
          :value="field.state.value"
          :options="kinds"
          :error="field.state.meta.errors[0] ?? false"
          test-id="source-kind"
          @change="(value) => field.handleChange(value as typeof field.state.value)"
        />
      </template>
    </form.Field>
    <form.Field
      v-for="item in texts"
      :key="item.key"
      :name="item.key"
      :validators="validators(item.key)"
    >
      <template #default="{ field }">
        <TextField
          v-bind="{
            type: item.type,
            help: item.help,
            required: item.required,
            autofocus: item.key === 'subject',
            label: t.fields[item.key],
            testId: `source-${item.key}`,
          }"
          :value="field.state.value"
          :error="field.state.meta.errors[0] ?? false"
          @change="field.handleChange"
          @blur="field.handleBlur"
        />
      </template>
    </form.Field>
    <form.Field name="text">
      <template #default="{ field }">
        <UFormField :label="t.form.text" :help="t.form.textHint">
          <UTextarea
            :model-value="field.state.value"
            :rows="5"
            class="wm:w-full"
            data-testid="source-text"
            @update:model-value="(next: string) => field.handleChange(next)"
          />
        </UFormField>
      </template>
    </form.Field>
    <div class="wm:flex wm:flex-col wm:gap-1">
      <label :for="pickId" class="wm:text-sm wm:font-medium">{{ t.form.pick }}</label>
      <input
        :id="pickId"
        type="file"
        multiple
        class="wm:text-sm"
        data-testid="source-files"
        @change="(event) => pick((event.target as HTMLInputElement).files)"
      />
      <p class="wm:text-xs wm:text-muted">{{ t.form.pickHint }}</p>
    </div>
    <form.Field v-if="files.length > 0" name="move">
      <template #default="{ field }">
        <fieldset class="wm:flex wm:flex-col wm:gap-1 wm:text-sm" data-testid="source-mode">
          <label class="wm:flex wm:items-center wm:gap-2">
            <input
              type="radio"
              :checked="!field.state.value"
              data-testid="source-copy"
              @change="field.handleChange(false)"
            />
            {{ t.form.copy }}
          </label>
          <label class="wm:flex wm:items-center wm:gap-2">
            <input
              type="radio"
              :checked="field.state.value"
              :disabled="!canMoveFiles"
              data-testid="source-move"
              @change="field.handleChange(true)"
            />
            {{ t.form.move }}
          </label>
          <p class="wm:text-xs wm:text-muted">
            {{ canMoveFiles ? t.form.moveHint : t.form.moveUnavailable }}
          </p>
        </fieldset>
      </template>
    </form.Field>
    <div
      v-if="(targets.value.value ?? []).length > 0"
      class="wm:text-xs"
      data-testid="source-targets"
    >
      <p class="wm:font-medium">{{ t.form.targets }}</p>
      <ul>
        <li v-for="path in targets.value.value" :key="path" class="wm:font-mono wm:break-all">
          {{ path }}
        </li>
      </ul>
    </div>
    <PanelFormFooter
      :message="command.message.value"
      :cancel="t.form.cancel"
      :apply="t.form.save"
      apply-id="source-save"
      @cancel="emit('cancel')"
    />
  </form>
</template>
