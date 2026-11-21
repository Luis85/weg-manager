import type { Component } from "vue";
import type { Catalog } from "../../application/messages";
import type { RouteLike, Routes } from "../../application/shell";

// Vue-free on purpose (only type imports): `host.ts` exports these for code that runs at plugin load.

/**
 * Loads a screen's component the first time its route is shown, so a screen's module is evaluated
 * when it is needed: `() => import("./shell").then((module) => module.ShellPanel)`.
 */
export type ScreenLoader = () => Promise<Component>;

/** One entry of the frame's navigation. */
export type MenuEntry<R extends RouteLike> = {
  readonly route: R;
  label(catalog: Catalog): string;
  /** An `i-lucide-*` icon; its `lucide:*` name must be in `SHELL_ICONS`. */
  readonly icon: string;
};

/**
 * What a surface shows: the routes, the screen of each, the frame's navigation and its context
 * area. `src/presentation/app-surface.ts` composes the app's from the modules' parts; tests build
 * their own with test routes.
 */
export type SurfaceDefinition<R extends RouteLike> = Routes<R> & {
  /**
   * The screen of a route, or `undefined` when it has none: the frame then shows not-found. One
   * route name has one screen; the frame loads it once per surface.
   */
  screen(route: R): ScreenLoader | undefined;
  readonly menu: readonly MenuEntry<R>[];
  /** Fills the frame's context area. The community switch comes with the first feature slice. */
  readonly context?: ScreenLoader;
};

/**
 * How a surface follows its view's route (ADR 0008). The view owns the route, because Obsidian
 * keeps it in the view state and in the leaf's history; the surface asks to navigate and hears of
 * every change, including back and forward.
 */
export type ViewNavigation<R extends RouteLike> = {
  current(): R;
  navigate(route: R): void;
  /** Calls `listener` with every new route; returns the unsubscribe. */
  onChange(listener: (route: R) => void): () => void;
};

export type MemoryNavigation<R extends RouteLike> = ViewNavigation<R> & {
  /** Every route shown so far, the first one included. */
  readonly visited: readonly R[];
  /** How many listeners follow it. */
  listeners(): number;
};

/** A navigation that keeps its route in memory: for the harness and tests, which have no view. */
export const memoryNavigation = <R extends RouteLike>(
  routes: Routes<R>,
  initial: R = routes.start,
): MemoryNavigation<R> => {
  let current = initial;
  const visited: R[] = [initial];
  const listeners = new Set<(route: R) => void>();
  return {
    current: () => current,
    navigate: (route) => {
      const next = routes.decode(route);
      if (routes.equals(next, current)) return;
      current = next;
      visited.push(next);
      for (const listener of listeners) listener(next);
    },
    onChange: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    visited,
    listeners: () => listeners.size,
  };
};
