/** How long a view waits after the last vault change before it recounts. */
export const RECOUNT_DELAY_MS = 300;

/**
 * Runs `fn` once, `ms` after the last call to `trigger`; a burst (a bulk sync, a folder move)
 * becomes one run. `cancel` drops a pending run, e.g. when the component's scope ends.
 */
export const debounce = (fn: () => void, ms: number) => {
  let timer: number | undefined;
  return {
    trigger: () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = undefined;
        fn();
      }, ms);
    },
    cancel: () => {
      if (timer !== undefined) window.clearTimeout(timer);
      timer = undefined;
    },
  };
};
