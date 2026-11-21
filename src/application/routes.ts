import { Schema } from "effect";
import { ShellRoute, routesOf } from "./shell";

/**
 * Every route of the app: the union of the modules' routes (ADR 0008). A module adds its route
 * schema to the list, and presentation's `appSurface` its screen; typecheck fails until it does.
 */
const Route = Schema.Union([ShellRoute]);
export type Route = typeof Route.Type;

/** How every view decodes its state. The demo panel is the start until a feature screen exists. */
export const appRoutes = routesOf(Route, { name: "welcome" });
