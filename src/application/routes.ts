import { Schema } from "effect";
import { COMMUNITIES_SECTION, COMMUNITY_SETTINGS } from "./communities";
import { DATA_ISSUES_SECTION } from "./notes";
import { routesOf, settingsRoute } from "./shell";

/**
 * The sections of the settings screen, one per module that contributes one, in the order its
 * navigation shows them (ADR 0008, amendment 22.11.2026). A module adds its section id here, and
 * presentation's `appSurface` its section; typecheck fails until it does.
 */
export const SETTINGS_SECTIONS = [COMMUNITIES_SECTION, DATA_ISSUES_SECTION] as const;
export type SettingsSection = (typeof SETTINGS_SECTIONS)[number];

/**
 * Every route of the app: the shell's settings screen on the modules' sections, and the routes
 * the modules add (ADR 0008). A module adds its route schema to the list, and presentation's
 * `appSurface` its screen; typecheck fails until it does.
 */
const Route = Schema.Union([settingsRoute(SETTINGS_SECTIONS)]);
export type Route = typeof Route.Type;

/** How every view decodes its state. The community settings are the start until the overview. */
export const appRoutes = routesOf(Route, COMMUNITY_SETTINGS);
