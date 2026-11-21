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

/**
 * The shell's services for one plugin load, wired to the Obsidian adapters, with `followers`
 * (the other modules' services, which may need the shell's) built on them. The host event adapter
 * comes last, so a follower that subscribes to the event bus while it is built sees `LayoutReady`
 * and `VaultReady`, which the adapter may publish while it is built itself.
 */
export const shellLayer = <A, E>(
  plugin: Plugin,
  options: ShellLayerOptions,
  followers: Layer.Layer<A, E, ShellServices>,
): Layer.Layer<ShellServices | A, E> => {
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
  return hostEventsLayer(plugin).pipe(
    Layer.provideMerge(followers.pipe(Layer.provideMerge(services))),
  );
};
