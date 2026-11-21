import {
  computed,
  defineAsyncComponent,
  inject,
  shallowRef,
  type App,
  type Component,
  type InjectionKey,
  type Ref,
  type ShallowRef,
} from "vue";
import type { Route } from "../../application/routes";
import type { RouteHistory, RouteLike } from "../../application/shell";
import type { SurfaceDefinition, ViewNavigation } from "./routing";

/** The routing of one surface. It is typed by `RouteLike` here; the composables narrow it. */
type SurfaceRouting = {
  readonly definition: SurfaceDefinition<RouteLike>;
  readonly route: Readonly<ShallowRef<RouteLike>>;
  readonly history: Readonly<ShallowRef<RouteHistory<RouteLike>>>;
  readonly navigate: (route: RouteLike) => void;
  readonly back: () => void;
  readonly forward: () => void;
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
 * Gives one surface its routing: route and history start at the view's and follow every change
 * the view reports. Returns the release that stops following the view.
 */
export const provideRouting = <R extends RouteLike>(
  app: App,
  definition: SurfaceDefinition<R>,
  navigation: ViewNavigation<R>,
): (() => void) => {
  const history = shallowRef<RouteHistory<R>>(navigation.history());
  const route = shallowRef<R>(history.value.current);
  const stop = navigation.onChange((next) => {
    history.value = next;
    route.value = next.current;
  });
  const screens = new Map<string, Component>();
  const routing: SurfaceRouting = {
    definition,
    route,
    history,
    navigate: (next) => navigation.navigate(next as R),
    back: () => navigation.back(),
    forward: () => navigation.forward(),
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
 * Navigates the view this component is shown in. The view's own history records the step, unless
 * the route is the current one.
 */
export const useNavigate = <R extends RouteLike = Route>(): ((route: R) => void) =>
  useRouting().navigate;

export type ViewHistory = {
  readonly canGoBack: Readonly<Ref<boolean>>;
  readonly canGoForward: Readonly<Ref<boolean>>;
  back(this: void): void;
  forward(this: void): void;
};

/** The history of the view this component is shown in: kept per view, in memory. */
export const useHistory = (): ViewHistory => {
  const { history, back, forward } = useRouting();
  return {
    canGoBack: computed(() => history.value.back.length > 0),
    canGoForward: computed(() => history.value.forward.length > 0),
    back,
    forward,
  };
};
