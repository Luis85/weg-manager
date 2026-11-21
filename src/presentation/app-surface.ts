import { COMMUNITY_SETTINGS } from "../application/communities";
import { appRoutes, type Route } from "../application/routes";
import type { ScreenLoader, SurfaceDefinition } from "./shell/host";

/**
 * The screen of every route, by name. A module that adds routes to `Route` adds their screens here;
 * typecheck fails until each name has one. Screens load lazily, so bootstrap can import this file
 * at plugin load without loading Vue.
 */
const screens: { readonly [Name in Route["name"]]: ScreenLoader } = {
  welcome: () => import("./shell").then(({ shellScreens }) => shellScreens.welcome),
  settings: () =>
    import("./communities").then(({ communitiesScreens }) => communitiesScreens.settings),
};

/**
 * What every view of the plugin shows (ADR 0008): the app's routes, their screens, the frame's
 * navigation and its context area (the community switch), composed from the modules' parts. It
 * holds no rule of its own.
 */
export const appSurface: SurfaceDefinition<Route> = {
  ...appRoutes,
  screen: (route) => screens[route.name],
  menu: [
    {
      route: COMMUNITY_SETTINGS,
      label: (catalog) => catalog.communities.route,
      icon: "i-lucide-building-2",
    },
    {
      route: { name: "welcome" },
      label: (catalog) => catalog.shell.routes.welcome,
      icon: "i-lucide-layout-dashboard",
    },
  ],
  context: () => import("./communities").then(({ CommunitySwitch }) => CommunitySwitch),
};
