import {
  computed,
  inject,
  onScopeDispose,
  provide,
  shallowRef,
  watch,
  type InjectionKey,
  type Ref,
} from "vue";

/** The modals of one surface that are open now; while any is, the frame behind them is inert. */
const MODALS_KEY: InjectionKey<Ref<ReadonlySet<symbol>>> = Symbol("weg-manager/modals");

/**
 * Gives one surface its record of open modals (`ShellApp` calls it) and returns whether the frame
 * behind them must be inert: no pointer, no focus, hidden from assistive technology.
 */
export const provideModals = (): Readonly<Ref<boolean>> => {
  const open = shallowRef<ReadonlySet<symbol>>(new Set());
  provide(MODALS_KEY, open);
  return computed(() => open.value.size > 0);
};

/** Puts the element marked `data-autofocus` inside a modal's content in focus, if there is one. */
const focusMarked = (event: Event): void => {
  // The content element; `instanceof Element` would fail for one in a pop-out window.
  const content = event.target as Partial<Element> | null;
  const target = content?.querySelector?.<HTMLElement>("[data-autofocus]");
  if (target === undefined || target === null) return;
  event.preventDefault();
  target.focus();
};

/**
 * Makes a Nuxt UI `Slideover` or `Modal` a modal for everyone (WCAG 2.4.3, 4.1.2): pass the result
 * as its `content` prop. While `open` is true, the surface's frame is inert; the content says
 * `aria-modal`; it opens with the focus on its element marked `data-autofocus` (else the first one
 * Reka finds), and when it closes `afterClose` decides where the focus goes, instead of Reka's
 * return to the element that opened it, which may be gone by then. Reka keeps trapping the focus
 * and closes on Escape.
 */
export const useModal = (open: () => boolean, afterClose: () => void) => {
  const modals = inject(MODALS_KEY, undefined);
  const token = Symbol("modal");
  const mark = (on: boolean) => {
    if (modals === undefined) return;
    const next = new Set(modals.value);
    if (on) next.add(token);
    else next.delete(token);
    modals.value = next;
  };
  watch(open, mark, { immediate: true });
  onScopeDispose(() => mark(false));
  return {
    "aria-modal": "true",
    onOpenAutoFocus: focusMarked,
    onCloseAutoFocus: (event: Event) => {
      event.preventDefault();
      afterClose();
    },
  } as const;
};
