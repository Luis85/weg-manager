import { Schema } from "effect";
import { COMMUNITY_SETTINGS, CommunitiesRoute } from "./communities";
import { routesOf } from "./shell";

/**
 * Every route of the app: the union of the modules' routes (ADR 0008). A module adds its route
 * schema to the list, and presentation's `appSurface` its screen; typecheck fails until it does.
 * The shell has no screen of its own.
 */
const Route = Schema.Union([CommunitiesRoute]);
export type Route = typeof Route.Type;

/** How every view decodes its state. The community settings are the start until the overview. */
export const appRoutes = routesOf(Route, COMMUNITY_SETTINGS);
