/**
 * The history of one view (ADR 0008, amendment of 2026-11-21): the plugin keeps it in memory per
 * view, because the view is a fixed tab and not part of Obsidian's leaf history. Plain data; each
 * step returns a new history and leaves the old one as it was.
 */
export type RouteHistory<R> = {
  /** The routes before `current`, the most recent last. */
  readonly back: readonly R[];
  readonly current: R;
  /** The routes after `current`, the next first. */
  readonly forward: readonly R[];
};

/** How many steps back a view keeps; older ones are dropped. */
export const HISTORY_LIMIT = 50;

/** A history that starts at `route`: a new or restored view. */
export const historyAt = <R>(route: R): RouteHistory<R> => ({
  back: [],
  current: route,
  forward: [],
});

/**
 * A navigation to `route`: the current route goes onto the back stack and the forward stack is
 * cleared. A visit to the current route changes nothing and returns the same history.
 */
export const visit = <R>(
  history: RouteHistory<R>,
  route: R,
  equals: (a: R, b: R) => boolean,
): RouteHistory<R> =>
  equals(route, history.current)
    ? history
    : {
        back: [...history.back, history.current].slice(-HISTORY_LIMIT),
        current: route,
        forward: [],
      };

/** One step back; the same history when there is nothing to go back to. */
export const stepBack = <R>(history: RouteHistory<R>): RouteHistory<R> => {
  const previous = history.back.at(-1);
  if (previous === undefined) return history;
  return {
    back: history.back.slice(0, -1),
    current: previous,
    forward: [history.current, ...history.forward],
  };
};

/** One step forward; the same history when there is nothing to go forward to. */
export const stepForward = <R>(history: RouteHistory<R>): RouteHistory<R> => {
  const [next, ...rest] = history.forward;
  if (next === undefined) return history;
  return { back: [...history.back, history.current], current: next, forward: rest };
};
