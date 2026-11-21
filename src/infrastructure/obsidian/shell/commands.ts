import type { Plugin } from "obsidian";
import type { AppRuntime } from "../../../application/app-services";
import { copyDiagnostics, type ShellCatalog } from "../../../application/shell";
import { runSafely } from "./run";

const COMMAND_IDS = ["open-view", "copy-diagnostics"] as const;

/**
 * Adds the plugin's commands (no default hotkeys), named in the UI language. Returns an undo for
 * a failed bootstrap; on a normal unload Obsidian removes them itself.
 */
export const registerCommands = (
  plugin: Plugin,
  runtime: AppRuntime,
  messages: ShellCatalog,
  openView: () => Promise<void>,
): (() => void) => {
  const names = messages.commands;
  const added: string[] = [];
  const add = (
    id: (typeof COMMAND_IDS)[number],
    name: string,
    callback: () => Promise<unknown>,
  ) => {
    plugin.addCommand({ id, name, callback });
    added.push(id);
  };
  add("open-view", names.openView, openView);
  add("copy-diagnostics", names.copyDiagnostics, () => runSafely(runtime, copyDiagnostics));
  return () => {
    for (const id of added) plugin.removeCommand(id);
  };
};
