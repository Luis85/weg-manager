import { Schema } from "effect";
import { COMMUNITY_SETTINGS } from "./communities";
import { routeSchemasOf, sectionsOf, type RouteOf, type SectionOf } from "./module";
import { APP_MODULES, type AppModule, type AppModuleName } from "./modules";
import { routesOf, settingsRoute, type SETTINGS } from "./shell";

/**
 * The sections of the settings screen, from the modules' manifests, in the order its navigation
 * shows them (ADR 0008, amendment 22.11.2026). Presentation's `appSurface` gives each its part;
 * typecheck fails until it does.
 */
export const SETTINGS_SECTIONS = sectionsOf(APP_MODULES);
export type SettingsSection = SectionOf<AppModule>;

/**
 * Every route of the app: the shell's settings screen on the modules' sections, and the routes
 * the modules' manifests add (ADR 0008). Presentation's `appSurface` gives each its screen;
 * typecheck fails until it does.
 */
const Route = Schema.Union([settingsRoute(SETTINGS_SECTIONS), ...routeSchemasOf(APP_MODULES)]);
export type Route = typeof Route.Type;

type ModuleNamed<Name extends AppModuleName> = Extract<AppModule, { readonly name: Name }>;

/** The names of the routes module `Name` has a screen for: the shell owns the settings screen. */
export type RouteNameOf<Name extends AppModuleName> =
  (Name extends "shell" ? typeof SETTINGS : never) | RouteOf<ModuleNamed<Name>>["name"];

/** The ids of the settings sections module `Name` adds. */
export type SectionIdOf<Name extends AppModuleName> = SectionOf<ModuleNamed<Name>>;

/** How every view decodes its state. The community settings are the start until the overview. */
export const appRoutes = routesOf(Route, COMMUNITY_SETTINGS);
