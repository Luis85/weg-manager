import type { AppServices } from "./app-services";
import type { Catalog } from "./messages";
import { commandsOf } from "./module";
import { APP_MODULES } from "./modules";
import type { Route } from "./routes";
import type { PluginCommand } from "./shell";

/** A command of the plugin: its label from the whole catalog, a route of the app, any service. */
export type AppCommand = PluginCommand<Catalog, Route, AppServices>;

/**
 * Every command of the plugin, from the modules' manifests in module order (ADR 0006); bootstrap
 * registers each (`registerCommands`).
 */
export const appCommands: readonly AppCommand[] = commandsOf(APP_MODULES);
