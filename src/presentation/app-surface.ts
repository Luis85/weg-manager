import { COMMUNITY_SETTINGS } from "../application/communities";
import { appRoutes, type Route, type SettingsSection } from "../application/routes";
import type { ScreenLoader, SettingsSectionPart, SurfaceDefinition } from "./shell/host";

/**
 * The screen of every route, by name. A module that adds routes to `Route` adds their screens here;
 * typecheck fails until each name has one. Screens load lazily, so bootstrap can import this file
 * at plugin load without loading Vue. The settings screen is the shell's.
 */
const screens: { readonly [Name in Route["name"]]: ScreenLoader } = {
  settings: () => import("./shell").then(({ SettingsScreen }) => SettingsScreen),
};

/**
 * The settings screen's sections, one per module that contributes one, in the order its
 * navigation shows them (ADR 0008, amendment 22.11.2026). Typed by `SettingsSection`: typecheck
 * fails while a section id has no part here, and for a part no module's id names.
 */
const sections: { readonly [Section in SettingsSection]: SettingsSectionPart } = {
  communities: {
    label: (catalog) => catalog.communities.route,
    component: () => import("./communities").then(({ communitiesSettings }) => communitiesSettings),
  },
  "data-issues": {
    label: (catalog) => catalog.notes.dataIssues.title,
    component: () => import("./notes").then(({ DataIssues }) => DataIssues),
    badge: () => import("./notes").then(({ DataIssuesBadge }) => DataIssuesBadge),
  },
};

/**
 * What every view of the plugin shows (ADR 0008): the app's routes, their screens, the settings
 * screen's sections, the frame's navigation and its context area (the community switch), composed
 * from the modules' parts. It holds no rule of its own.
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
  ],
  context: () => import("./communities").then(({ communitiesFrame }) => communitiesFrame.context),
  sections,
};
