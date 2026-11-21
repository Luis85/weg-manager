<script setup lang="ts">
import UAlert from "@nuxt/ui/components/Alert.vue";
import type { ButtonProps } from "@nuxt/ui";
import { computed } from "vue";
import { copyDiagnostics } from "../../application/use-cases";
import type { UserMessage, UserMessageAction } from "../../application/user-messages";
import { useCommand, useMessages } from "../runtime/use-runtime";

/**
 * Renders any `UserMessage` the same way in every view. Its action becomes a button when a
 * handler exists: `copy-diagnostics` is built in, the others come from the parent.
 */
const props = defineProps<{
  message: UserMessage;
  handlers?: Partial<Record<UserMessageAction, () => unknown>>;
}>();

const { actions: ACTION_LABELS } = useMessages();

const COLORS = { info: "info", warning: "warning", error: "error" } as const;

const copy = useCommand(() => copyDiagnostics);

const actions = computed<ButtonProps[]>(() => {
  const action = props.message.action;
  if (action === undefined) return [];
  const handler =
    props.handlers?.[action] ?? (action === "copy-diagnostics" ? () => copy.run() : undefined);
  if (handler === undefined) return [];
  return [
    { label: ACTION_LABELS[action], size: "xs", variant: "outline", onClick: () => handler() },
  ];
});
</script>

<template>
  <UAlert
    role="alert"
    :color="COLORS[message.severity]"
    variant="subtle"
    :title="message.title"
    :description="message.detail"
    :actions="actions"
  />
</template>
