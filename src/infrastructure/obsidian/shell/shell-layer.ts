import { Layer } from "effect";
import type { Plugin } from "obsidian";
import {
  EventBusLive,
  LoggerLive,
  SettingsServiceLive,
  type Language,
  type LoggerOptions,
  type ShellServices,
} from "../../../application/shell";
import { consoleSinkLayer } from "../../logging/console-sink";
import { incidentsLayer } from "../../logging/incidents";
import { hostEventsLayer } from "./events";
import { obsidianLayer } from "./layers";

export type ShellLayerOptions = LoggerOptions & {
  /** The UI language of this plugin load, resolved once with `hostLanguage()`. */
  readonly language: Language;
};

/** The shell's services for one plugin load, wired to the Obsidian adapters. */
export const shellLayer = (
  plugin: Plugin,
  options: ShellLayerOptions,
): Layer.Layer<ShellServices> => {
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
