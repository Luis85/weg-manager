import { appRoutes, type Route } from "../application/routes";
import type { ScreenLoader, SurfaceDefinition } from "./shell/host";

/**
 * The screen of every route, by name. A module that adds routes to `Route` adds their screens here;
 * typecheck fails until each name has one. Screens load lazily, so bootstrap can import this file
 * at plugin load without loading Vue.
 */
const screens: { readonly [Name in Route["name"]]: ScreenLoader } = {
  welcome: () => import("./shell").then(({ shellScreens }) => shellScreens.welcome),
};

/**
 * What every view of the plugin shows (ADR 0008): the app's routes, their screens and the frame's
 * navigation, composed from the modules' parts. It holds no rule of its own.
 */
export const appSurface: SurfaceDefinition<Route> = {
  ...appRoutes,
  screen: (route) => screens[route.name],
  menu: [
    {
      route: { name: "welcome" },
      label: (catalog) => catalog.shell.routes.welcome,
      icon: "i-lucide-layout-dashboard",
    },
  ],
};
