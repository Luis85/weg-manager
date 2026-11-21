import {
  defineAsyncComponent,
  inject,
  shallowRef,
  type App,
  type Component,
  type InjectionKey,
  type ShallowRef,
} from "vue";
import type { Route } from "../../application/routes";
import type { RouteLike } from "../../application/shell";
import type { SurfaceDefinition, ViewNavigation } from "./routing";

/** The routing of one surface. It is typed by `RouteLike` here; the composables narrow it. */
type SurfaceRouting = {
  readonly definition: SurfaceDefinition<RouteLike>;
  readonly route: Readonly<ShallowRef<RouteLike>>;
  readonly navigate: (route: RouteLike) => void;
  /** The async component of each route name, created once per surface. */
  readonly screenOf: (route: RouteLike) => Component | undefined;
  readonly context: Component | undefined;
};

/** One entry of the frame's navigation, as `AppFrame` shows it. */
export type FrameEntry = {
  readonly label: string;
  readonly icon: string;
  readonly current: boolean;
  select(): void;
};

const ROUTING_KEY: InjectionKey<SurfaceRouting> = Symbol("weg-manager/routing");

/**
 * Gives one surface its routing: the route starts at the view's current one and follows every
 * change the view reports. Returns the release that stops following the view.
 */
export const provideRouting = <R extends RouteLike>(
  app: App,
  definition: SurfaceDefinition<R>,
  navigation: ViewNavigation<R>,
): (() => void) => {
  const route = shallowRef<R>(navigation.current());
  const stop = navigation.onChange((next) => {
    route.value = next;
  });
  const screens = new Map<string, Component>();
  const routing: SurfaceRouting = {
    definition,
    route,
    navigate: (next) => navigation.navigate(next as R),
    screenOf: (next) => {
      const loader = definition.screen(next as R);
      if (loader === undefined) return undefined;
      const known = screens.get(next.name);
      if (known !== undefined) return known;
      const screen = defineAsyncComponent(loader);
      screens.set(next.name, screen);
      return screen;
    },
    context:
      definition.context === undefined ? undefined : defineAsyncComponent(definition.context),
  };
  app.provide(ROUTING_KEY, routing);
  return stop;
};

/** The routing of the surface the component lives in. */
export const useRouting = (): SurfaceRouting => {
  const routing = inject(ROUTING_KEY);
  if (routing === undefined) throw new Error("useRouting() outside a mounted surface");
  return routing;
};

/** The route of the view this component is shown in; it changes on every navigation. */
export const useRoute = <R extends RouteLike = Route>(): Readonly<ShallowRef<R>> =>
  useRouting().route as Readonly<ShallowRef<R>>;

/**
 * Navigates the view this component is shown in. Obsidian records the step in the leaf's history,
 * so its back and forward buttons return to it.
 */
export const useNavigate = <R extends RouteLike = Route>(): ((route: R) => void) =>
  useRouting().navigate;
