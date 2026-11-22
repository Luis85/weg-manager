import type { Plugin } from "obsidian";
import type { AppRuntime, AppServices } from "../../../application/app-services";
import type { CommandAction, PluginCommand } from "../../../application/shell";
import { runSafely } from "./run";

/**
 * Adds every command of `commands` (`appCommands` in the plugin), named from `messages` in the UI
 * language, without hotkeys. An `open` command calls `open` with its route; a `run` command runs
 * its use case through `runtime`, a defect reported once. If an `addCommand` throws, the commands
 * added so far are removed and the error rethrown. Returns an undo for a failed bootstrap; on a
 * normal unload Obsidian removes the commands itself.
 */
export const registerCommands = <Messages, Route>(
  plugin: Plugin,
  runtime: AppRuntime,
  commands: readonly PluginCommand<Messages, Route, AppServices>[],
  messages: Messages,
  open: (route?: Route) => Promise<unknown>,
): (() => void) => {
  const perform = (action: CommandAction<Route, AppServices>): Promise<unknown> => {
    switch (action._tag) {
      case "open":
        return open(action.route);
      case "run":
        return runSafely(runtime, action.effect);
    }
  };
  const added: string[] = [];
  const removeAll = () => {
    for (const id of added.splice(0)) plugin.removeCommand(id);
  };
  try {
    for (const { id, name, action } of commands) {
      plugin.addCommand({ id, name: name(messages), callback: () => perform(action) });
      added.push(id);
    }
  } catch (error) {
    removeAll();
    throw error;
  }
  return removeAll;
};
