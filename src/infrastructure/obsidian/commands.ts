import type { Plugin } from "obsidian";
import type { AppRuntime } from "../../application/app-services";
import { copyDiagnostics, showGreeting } from "../../application/use-cases";
import { runSafely } from "./run";

const COMMAND_IDS = ["open-view", "show-greeting", "copy-diagnostics"] as const;

/**
 * Adds the plugin's commands (no default hotkeys). Returns an undo for a failed bootstrap;
 * on a normal unload Obsidian removes them itself.
 */
export const registerCommands = (
  plugin: Plugin,
  runtime: AppRuntime,
  openView: () => Promise<void>,
): (() => void) => {
  const added: string[] = [];
  const add = (
    id: (typeof COMMAND_IDS)[number],
    name: string,
    callback: () => Promise<unknown>,
  ) => {
    plugin.addCommand({ id, name, callback });
    added.push(id);
  };
  add("open-view", "Ansicht öffnen", openView);
  add("show-greeting", "Begrüßung anzeigen", () => runSafely(runtime, showGreeting));
  add("copy-diagnostics", "Diagnose kopieren", () => runSafely(runtime, copyDiagnostics));
  return () => {
    for (const id of added) plugin.removeCommand(id);
  };
};
