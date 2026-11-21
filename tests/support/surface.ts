import { Schema } from "effect";
import { defineComponent, h } from "vue";
import type { AppRuntime } from "../../src/application/app-services";
import { routesOf } from "../../src/application/shell/routes";
import { appSurface } from "../../src/presentation/app-surface";
import { NotFoundState, mountSurface, useNavigate, useRoute } from "../../src/presentation/shell";
import {
  memoryNavigation,
  type SurfaceDefinition,
  type ViewNavigation,
} from "../../src/presentation/shell/host";
import type { MountOptions } from "../../src/presentation/shell/mount";

/** Mounts the app's own surface (`appSurface`) on an in-memory navigation, as the harness does. */
export const mountApp = (
  root: HTMLElement,
  runtime: AppRuntime,
  options: Partial<MountOptions<typeof appSurface.start>> = {},
) =>
  mountSurface(root, runtime, {
    surface: appSurface,
    navigation: memoryNavigation(appSurface),
    ...options,
  });

/**
 * Test-only routes, injected through the same seam as the app's: two screens, one with a
 * parameter, and one route without a screen.
 */
export const TestRoute = Schema.Union([
  Schema.Struct({ name: Schema.Literal("first") }),
  Schema.Struct({ name: Schema.Literal("second") }),
  Schema.Struct({ name: Schema.Literal("item"), id: Schema.String }),
  Schema.Struct({ name: Schema.Literal("missing") }),
]);
export type TestRoute = typeof TestRoute.Type;

const testRoutes = routesOf(TestRoute, { name: "first" });

/**
 * A screen that shows its route and can navigate to another. The item `gone` stands for a record
 * that no longer exists: the screen shows the shell's not-found state.
 */
const screen = (title: string) =>
  defineComponent({
    setup() {
      const route = useRoute<TestRoute>();
      const navigate = useNavigate<TestRoute>();
      const gone = () => route.value.name === "item" && route.value.id === "gone";
      return () =>
        gone()
          ? h(NotFoundState)
          : h("div", { "data-testid": "screen" }, [
              h("h2", title),
              h("p", { "data-testid": "route" }, JSON.stringify(route.value)),
              h(
                "button",
                { type: "button", onClick: () => navigate({ name: "item", id: "42" }) },
                "open item",
              ),
            ]);
    },
  });

const First = screen("First screen");
const Second = screen("Second screen");
const Item = screen("Item screen");

export const testSurface = (
  extra: Partial<SurfaceDefinition<TestRoute>> = {},
): SurfaceDefinition<TestRoute> => ({
  ...testRoutes,
  screen: (route) => {
    switch (route.name) {
      case "first":
        return async () => First;
      case "second":
        return async () => Second;
      case "item":
        return async () => Item;
      case "missing":
        return undefined;
    }
  },
  menu: [
    { route: { name: "first" }, label: () => "First", icon: "i-lucide-layout-dashboard" },
    { route: { name: "second" }, label: () => "Second", icon: "i-lucide-info" },
  ],
  ...extra,
});

/** Mounts `surface` on `navigation` (an in-memory one by default). */
export const mountTest = (
  root: HTMLElement,
  runtime: AppRuntime,
  surface: SurfaceDefinition<TestRoute> = testSurface(),
  navigation: ViewNavigation<TestRoute> = memoryNavigation(surface),
) => ({ close: mountSurface(root, runtime, { surface, navigation }) });
