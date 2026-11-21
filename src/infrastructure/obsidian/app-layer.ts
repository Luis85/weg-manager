import { Layer } from "effect";
import type { Plugin } from "obsidian";
import type { AppServices } from "../../application/app-services";
import { EventBusLive } from "../../application/shell/event-bus";
import type { Language } from "../../application/shell/i18n";
import { LoggerLive, type LoggerOptions } from "../../application/shell/logger";
import { SettingsServiceLive } from "../../application/shell/settings-service";
import { consoleSinkLayer } from "../logging/console-sink";
import { incidentsLayer } from "../logging/incidents";
import { hostEventsLayer } from "./shell/events";
import { obsidianLayer } from "./shell/layers";

export type AppLayerOptions = LoggerOptions & {
  /** The UI language of this plugin load, resolved once with `hostLanguage()`. */
  readonly language: Language;
};

/** All application services for one plugin load, wired to the Obsidian adapters. */
export const appLayer = (plugin: Plugin, options: AppLayerOptions): Layer.Layer<AppServices> => {
  const settings = SettingsServiceLive.pipe(
    Layer.provideMerge(obsidianLayer(plugin, options.language)),
  );
  const logger = LoggerLive(options).pipe(Layer.provide(consoleSinkLayer));
  const services = Layer.mergeAll(
    logger.pipe(Layer.provideMerge(settings)),
    incidentsLayer,
    EventBusLive,
  );
  // Built last, so every subscriber that a service starts while it is built sees `LayoutReady`.
  return hostEventsLayer(plugin).pipe(Layer.provideMerge(services));
};
