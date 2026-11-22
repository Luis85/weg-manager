import type { Component } from "vue";
import type { Catalog } from "../../application/messages";
import type { AppModuleName } from "../../application/modules";
import type { Route, RouteNameOf, SectionIdOf } from "../../application/routes";
import {
  SETTINGS,
  historyAt,
  stepBack,
  stepForward,
  visit,
  type RouteHistory,
  type RouteLike,
  type SettingsRoute,
  type Routes,
} from "../../application/shell";

// Vue-free on purpose (Vue only as types): `host.ts` exports these for code that runs at plugin load.

/**
 * Loads a screen's component the first time its route is shown, so a screen's module is evaluated
 * when it is needed: `() => import("./communities").then((module) => module.communitiesScreens.settings)`.
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
 * What a module puts into the shell's settings screen: one section (ADR 0008, amendment
 * 22.11.2026), with its entry in the screen's navigation. `badge` is a small component shown in
 * that entry, such as a count of notes with issues.
 */
export type SettingsSectionPart = {
  readonly label: (catalog: Catalog) => string;
  readonly component: ScreenLoader;
  readonly badge?: ScreenLoader;
};

/**
 * What module `Name` adds to every view (ADR 0006, amendment 2026-11-22): the screen of each route
 * its manifest adds (the shell's: the settings screen), the part of each settings section it adds,
 * its entries in the frame's navigation and what it puts into the frame's context area. A module
 * writes it in its `screens.ts`, which code at plugin load imports: it loads its components only
 * through `import()`, so it evaluates no Vue. Typecheck fails while a route or a section of the
 * module's manifest has no part here, or a part has no route or section.
 */
export type ModuleScreens<Name extends AppModuleName> = {
  readonly screens: { readonly [RouteName in RouteNameOf<Name>]: ScreenLoader };
  readonly sections: {
    readonly [Section in SectionIdOf<Name>]: SettingsSectionPart;
  };
  readonly menu?: readonly MenuEntry<Route>[];
  readonly context?: ScreenLoader;
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
  /** Fills the frame's context area: the community switch in the plugin. */
  readonly context?: ScreenLoader;
  /**
   * The settings screen's sections by their id (the route's `section`), in the order its
   * navigation shows them. `src/presentation/app-surface.ts` types them by `SettingsSection`.
   */
  readonly sections?: Readonly<Record<string, SettingsSectionPart>>;
};

/**
 * The entries of the frame's navigation (ADR 0008, amendment 2026-11-22): the modules' entries,
 * then the shell's settings entry when any module adds a settings section. The entry opens the
 * settings screen on the section that comes first in `sections`, which the composition orders
 * (`SETTINGS_SECTIONS`); it is current on every section, as every entry is on every route of its
 * screen.
 */
export const frameMenu = <R extends RouteLike>(
  definition: SurfaceDefinition<R>,
): readonly MenuEntry<RouteLike>[] => {
  const [first] = Object.keys(definition.sections ?? {});
  if (first === undefined) return definition.menu;
  const route: SettingsRoute = { name: SETTINGS, section: first };
  const settings: MenuEntry<RouteLike> = {
    route,
    label: (catalog) => catalog.shell.frame.settings,
    icon: "i-lucide-settings",
  };
  return [...definition.menu, settings];
};

/**
 * A view's route and its own history (ADR 0008, amendment): the view keeps them, Obsidian keeps the
 * route in the view state. The surface navigates through it and hears of every change.
 */
export type ViewNavigation<R extends RouteLike> = {
  current(): R;
  history(): RouteHistory<R>;
  /** A navigation: pushes the current route onto the back stack, unless `route` is current. */
  navigate(route: R): void;
  back(): void;
  forward(): void;
  /** Calls `listener` with the history after every change; returns the unsubscribe. */
  onChange(listener: (history: RouteHistory<R>) => void): () => void;
};

export type MemoryNavigation<R extends RouteLike> = ViewNavigation<R> & {
  /** Starts the history over at `route`, as a view does with the state it is opened with. */
  reset(route: R): void;
  /** Every route shown so far, the first one included. */
  readonly visited: readonly R[];
  /** How many listeners follow it. */
  listeners(): number;
};

/**
 * A route and its history in memory, per view: `ShellView` keeps one, the harness and tests use one
 * without a view. Routes are decoded on the way in, so equal routes are equal by value.
 */
export const memoryNavigation = <R extends RouteLike>(
  routes: Routes<R>,
  initial: R = routes.start,
): MemoryNavigation<R> => {
  let history = historyAt(initial);
  const visited: R[] = [initial];
  const listeners = new Set<(history: RouteHistory<R>) => void>();
  const move = (next: RouteHistory<R>) => {
    if (next === history) return;
    history = next;
    visited.push(next.current);
    for (const listener of listeners) listener(next);
  };
  return {
    current: () => history.current,
    history: () => history,
    navigate: (route) => move(visit(history, routes.decode(route), (a, b) => routes.equals(a, b))),
    back: () => move(stepBack(history)),
    forward: () => move(stepForward(history)),
    reset: (route) => move(historyAt(routes.decode(route))),
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
