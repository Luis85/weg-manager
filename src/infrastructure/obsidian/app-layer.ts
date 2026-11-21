import { Layer } from "effect";
import type { Plugin } from "obsidian";
import type { AppServices } from "../../application/app-services";
import { notesLayer } from "./notes";
import { shellLayer, type ShellLayerOptions } from "./shell";

export type AppLayerOptions = ShellLayerOptions;

/**
 * All application services for one plugin load: the modules' Layers, merged (ADR 0006). A module
 * that needs the shell's services is provided with them here.
 */
export const appLayer = (plugin: Plugin, options: AppLayerOptions): Layer.Layer<AppServices> =>
  Layer.mergeAll(shellLayer(plugin, options), notesLayer(plugin));
