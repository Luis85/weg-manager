import { Notice } from "obsidian";
import type { UserMessage } from "../../../application/shell";

/** Milliseconds a notice stays visible; errors need time to read and act on. */
export const NOTICE_DURATION = { info: 4000, warning: 8000, error: 12000 } as const;

/**
 * Appends a message's detail and its link to `parent`, with DOM APIs only (no innerHTML). The link
 * shows its address and opens outside Obsidian, in the browser.
 */
const appendDetail = (parent: DocumentFragment, message: UserMessage): void => {
  if (message.detail !== "") parent.createDiv({ text: message.detail });
  if (message.link !== undefined) {
    parent.createEl("a", {
      text: message.link,
      attr: { href: message.link, target: "_blank", rel: "noopener" },
    });
  }
};

/** A message's detail and link as a fragment, for a setting's description. */
export const detailFragment = (message: UserMessage): DocumentFragment =>
  createFragment((fragment) => appendDetail(fragment, message));

/** Builds the notice body with DOM APIs only (no innerHTML). */
const messageFragment = (message: UserMessage): DocumentFragment =>
  createFragment((fragment) => {
    fragment.createEl("strong", { text: message.title });
    appendDetail(fragment, message);
  });

/** Shows a `UserMessage` as one Obsidian notice. */
export const showMessage = (message: UserMessage): Notice =>
  new Notice(messageFragment(message), NOTICE_DURATION[message.severity]);
