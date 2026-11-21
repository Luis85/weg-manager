import { Layer } from "effect";
import type { Plugin } from "obsidian";
import type { AppServices } from "../../application/app-services";
import { EventBusLive } from "../../application/event-bus";
import { LoggerLive, type LoggerOptions } from "../../application/logger";
import { SettingsServiceLive } from "../../application/settings-service";
import { consoleSinkLayer } from "../logging/console-sink";
import { incidentsLayer } from "../logging/incidents";
import { hostEventsLayer } from "./events";
import { obsidianLayer } from "./layers";

/** All application services for one plugin load, wired to the Obsidian adapters. */
export const appLayer = (plugin: Plugin, options: LoggerOptions): Layer.Layer<AppServices> => {
  const settings = SettingsServiceLive.pipe(Layer.provideMerge(obsidianLayer(plugin)));
  const logger = LoggerLive(options).pipe(Layer.provide(consoleSinkLayer));
  const services = Layer.mergeAll(
    logger.pipe(Layer.provideMerge(settings)),
    incidentsLayer,
    EventBusLive,
  );
  // Built last, so every subscriber that a service starts while it is built sees `LayoutReady`.
  return hostEventsLayer(plugin).pipe(Layer.provideMerge(services));
};
