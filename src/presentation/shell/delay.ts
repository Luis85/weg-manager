import { onScopeDispose, shallowRef, watch, type Ref } from "vue";

/**
 * How long a wait lasts before it shows as loading (design handoff 02, B-NFR-04): a read that is
 * done sooner shows nothing in between, so the screen does not flicker.
 */
const LOADING_DELAY_MS = 300;

/**
 * True once `source` has been true for `delay` milliseconds without a break, false as soon as it
 * turns false. A view shows loading through it.
 */
export const useDelayed = (
  source: () => boolean,
  delay = LOADING_DELAY_MS,
): Readonly<Ref<boolean>> => {
  const shown = shallowRef(false);
  let timer: number | undefined;
  const stop = () => {
    if (timer !== undefined) window.clearTimeout(timer);
    timer = undefined;
  };
  watch(
    source,
    (on) => {
      stop();
      shown.value = false;
      if (on) {
        timer = window.setTimeout(() => {
          shown.value = true;
        }, delay);
      }
    },
    { immediate: true },
  );
  onScopeDispose(stop);
  return shown;
};
