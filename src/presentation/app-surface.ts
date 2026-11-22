import { APP_MODULES, type AppModuleName } from "../application/modules";
import {
  SETTINGS_SECTIONS,
  appRoutes,
  type Route,
  type SettingsSection,
} from "../application/routes";
import { communitiesScreens } from "./communities/screens";
import { notesScreens } from "./notes/screens";
import type {
  ModuleScreens,
  ScreenLoader,
  SettingsSectionPart,
  SurfaceDefinition,
} from "./shell/host";
import { shellScreens } from "./shell/screens";

/**
 * The screens of every module, by its name (ADR 0006, amendment 22.11.2026): each module's
 * `screens.ts`, which loads its components lazily, so bootstrap can import this file at plugin
 * load without loading Vue. Typecheck fails until every module of `APP_MODULES` has its entry,
 * and each entry until it has a screen for each of its module's routes and a part for each of its
 * settings sections.
 */
const MODULE_SCREENS: { readonly [Name in AppModuleName]: ModuleScreens<Name> } = {
  shell: shellScreens,
  notes: notesScreens,
  communities: communitiesScreens,
};

/** The modules' screens in module order (`APP_MODULES`). */
const parts = APP_MODULES.map(({ name }): ModuleScreens<AppModuleName> => MODULE_SCREENS[name]);

// Each route name and each section id belongs to one module, whose entry has its part (typed
// above); merged, they cover `Route` and `SettingsSection`. The casts only name the merge.
const screens = Object.fromEntries(parts.flatMap((part) => Object.entries(part.screens))) as {
  readonly [Name in Route["name"]]: ScreenLoader;
};
const sectionParts = Object.fromEntries(parts.flatMap((part) => Object.entries(part.sections))) as {
  readonly [Section in SettingsSection]: SettingsSectionPart;
};

/** The frame has one context area; the module that fills it (the community switch). */
const [context] = parts.flatMap((part) => (part.context === undefined ? [] : [part.context]));

/**
 * What every view of the plugin shows (ADR 0008): the app's routes, their screens, the settings
 * screen's sections in the order of `SETTINGS_SECTIONS`, the frame's navigation and its context
 * area, composed from the modules' parts. It holds no rule of its own.
 */
export const appSurface: SurfaceDefinition<Route> = {
  ...appRoutes,
  screen: (route) => screens[route.name],
  menu: parts.flatMap((part) => part.menu ?? []),
  ...(context === undefined ? {} : { context }),
  sections: Object.fromEntries(SETTINGS_SECTIONS.map((id) => [id, sectionParts[id]])),
};
