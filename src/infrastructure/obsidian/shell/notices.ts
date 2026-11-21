import { Notice } from "obsidian";
import type { UserMessage } from "../../../application/shell";

/** Milliseconds a notice stays visible; errors need time to read and act on. */
export const NOTICE_DURATION = { info: 4000, warning: 8000, error: 12000 } as const;

/** Builds the notice body with DOM APIs only (no innerHTML). */
const messageFragment = (message: UserMessage): DocumentFragment =>
  createFragment((fragment) => {
    fragment.createEl("strong", { text: message.title });
    if (message.detail !== "") fragment.createDiv({ text: message.detail });
  });

/** Shows a `UserMessage` as one Obsidian notice. */
export const showMessage = (message: UserMessage): Notice =>
  new Notice(messageFragment(message), NOTICE_DURATION[message.severity]);
