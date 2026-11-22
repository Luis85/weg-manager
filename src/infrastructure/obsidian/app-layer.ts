import type { Layer } from "effect";
import type { Plugin } from "obsidian";
import type { AppServices } from "../../application/app-services";
import { appServicesLayer, type AppServicesOptions } from "../../application/app-services-layer";
import { notesAdapters } from "./notes";
import { shellAdapters } from "./shell";

export type AppLayerOptions = Omit<AppServicesOptions, "noteTypes">;

/**
 * All application services for one plugin load: the application's service graph
 * (`appServicesLayer`) over the Obsidian adapters of every module's ports (ADR 0006). The plugin
 * indexes the note types of every feature (`appNoteTypes`).
 */
export const appLayer = (plugin: Plugin, options: AppLayerOptions): Layer.Layer<AppServices> =>
  appServicesLayer({ ...shellAdapters(plugin), ...notesAdapters(plugin) }, options);
