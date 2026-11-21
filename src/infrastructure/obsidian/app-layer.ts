import { Layer } from "effect";
import type { Plugin } from "obsidian";
import type { AppServices } from "../../application/app-services";
import { LoggerLive, type LoggerOptions } from "../../application/logger";
import { SettingsServiceLive } from "../../application/settings-service";
import { consoleSinkLayer } from "../logging/console-sink";
import { incidentsLayer } from "../logging/incidents";
import { obsidianLayer } from "./layers";

/** All application services for one plugin load, wired to the Obsidian adapters. */
export const appLayer = (plugin: Plugin, options: LoggerOptions): Layer.Layer<AppServices> => {
  const settings = SettingsServiceLive.pipe(Layer.provideMerge(obsidianLayer(plugin)));
  const logger = LoggerLive(options).pipe(Layer.provide(consoleSinkLayer));
  return Layer.mergeAll(logger.pipe(Layer.provideMerge(settings)), incidentsLayer);
};
