import type { AppServices } from "./app-services";
import type { Catalog } from "./messages";
import type { Route } from "./routes";
import { shellCommands, type PluginCommand } from "./shell";

/** A command of the plugin: its label from the whole catalog, a route of the app, any service. */
export type AppCommand = PluginCommand<Catalog, Route, AppServices>;

/**
 * Every command of the plugin, composed from the modules' parts (ADR 0006): composition only, like
 * `note-types.ts`. A feature adds its commands here, from its application index; bootstrap
 * registers each (`registerCommands`).
 */
export const appCommands: readonly AppCommand[] = [...shellCommands];
