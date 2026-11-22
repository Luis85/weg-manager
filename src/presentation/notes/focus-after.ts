import { onScopeDispose, shallowRef, watch } from "vue";

/** What the focus needs to know of a record in a list: its identity and whether it is unique. */
type KeyedRecord = {
  readonly id: string | undefined;
  readonly path: string;
  readonly issues: readonly { readonly code: string }[];
};

/** A control of a record's card that takes the focus (`data-focus` on it). */
export type CardControl = "edit" | "remove";

/**
 * Where the focus goes once a sheet or dialog has closed: a record's card (its `control`, by
 * default its edit button, else its name), or the create action, once the card `gone` has left
 * the list.
 */
export type FocusTarget =
  | { readonly card: string; readonly control?: CardControl | undefined }
  | { readonly add: true; readonly gone?: string | undefined };

/** How long a focus target waits for the list to show it; the index follows a write in ~0.1 s. */
const FOCUS_WAIT_MS = 3000;

/**
 * A card's key in the list and for the focus: the record's id, which survives a rename of its
 * file, or its path for a note without an id of its own (none, or one another note carries too).
 */
export const cardKey = (record: KeyedRecord): string =>
  record.id === undefined || record.issues.some((issue) => issue.code === "id.duplicate")
    ? `path:${record.path}`
    : `id:${record.id}`;

/**
 * Keeps the focus on the screen across a sheet or dialog (WCAG 2.4.3). The screen marks each card
 * with `data-card-key` (`cardKey`), and the elements that take the focus with `data-focus`: a
 * card's `edit` and `remove` buttons and its `name` heading, and the screen's `add` action.
 * `opened` notes where the focus goes back to when it is cancelled; `after` where it goes after it
 * did its work (the saved card, the create action after a delete); `closed` (the modal's
 * `afterClose`) moves it there as soon as the list shows the target, because the index follows a
 * write a moment later and a created or renamed card is not there yet.
 */
export const useFocusAfter = (
  root: () => HTMLElement | undefined,
  records: () => readonly unknown[],
) => {
  let back: FocusTarget | undefined;
  let next: FocusTarget | undefined;
  let timer: number | undefined;
  const pending = shallowRef<FocusTarget>();

  const element = (target: FocusTarget, screen: HTMLElement): HTMLElement | undefined => {
    const cards = [...screen.querySelectorAll<HTMLElement>("[data-card-key]")];
    if ("card" in target) {
      const card = cards.find((candidate) => candidate.dataset["cardKey"] === target.card);
      return (
        card?.querySelector<HTMLElement>(`[data-focus=${target.control ?? "edit"}]`) ??
        card?.querySelector<HTMLElement>("[data-focus=name]") ??
        undefined
      );
    }
    if (cards.some((candidate) => candidate.dataset["cardKey"] === target.gone)) return undefined;
    return screen.querySelector<HTMLElement>("[data-focus=add]") ?? undefined;
  };

  const attempt = () => {
    const target = pending.value;
    const screen = root();
    if (target === undefined || screen === undefined) return;
    const found = element(target, screen);
    if (found === undefined) return;
    found.focus();
    pending.value = undefined;
  };

  watch([pending, records], attempt, { flush: "post" });
  onScopeDispose(() => window.clearTimeout(timer));

  return {
    opened: (target: FocusTarget) => {
      back = target;
      next = undefined;
    },
    after: (target: FocusTarget) => {
      next = target;
    },
    closed: () => {
      pending.value = next ?? back;
      back = undefined;
      next = undefined;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        pending.value = undefined;
      }, FOCUS_WAIT_MS);
      attempt();
    },
  };
};
