import type { Plugin } from "obsidian";
import type { AppRuntime } from "../../../application/app-services";
import type { Catalog } from "../../../application/shell/i18n";
import { copyDiagnostics, showGreeting } from "../../../application/shell/use-cases";
import { runSafely } from "./run";

const COMMAND_IDS = ["open-view", "show-greeting", "copy-diagnostics"] as const;

/**
 * Adds the plugin's commands (no default hotkeys), named in the UI language. Returns an undo for
 * a failed bootstrap; on a normal unload Obsidian removes them itself.
 */
export const registerCommands = (
  plugin: Plugin,
  runtime: AppRuntime,
  messages: Catalog,
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
  add("show-greeting", names.showGreeting, () => runSafely(runtime, showGreeting));
  add("copy-diagnostics", names.copyDiagnostics, () => runSafely(runtime, copyDiagnostics));
  return () => {
    for (const id of added) plugin.removeCommand(id);
  };
};
