import type { Effect } from "effect";
import type { ShellCatalog } from "./i18n/catalog";
import type { ShellServices } from "./services";
import { copyDiagnostics } from "./use-cases";

/**
 * What a command does: open a route in the plugin's view (none keeps an open view's own route), or
 * run a use case. A use case run by a command handles its expected failures itself, usually as a
 * notice, as `copyDiagnostics` does; a defect is reported once by the host.
 */
export type CommandAction<Route, R> =
  | { readonly _tag: "open"; readonly route?: Route }
  | { readonly _tag: "run"; readonly effect: Effect.Effect<unknown, never, R> };

/**
 * A command a module contributes to Obsidian's command palette (`appCommands` composes them).
 * `id` is kebab-case without the plugin id, which Obsidian prefixes itself; `name` reads the label
 * from the module's part of the catalog. There is no hotkey: Obsidian's guidelines leave hotkeys to
 * the user.
 */
export type PluginCommand<Messages, Route, R> = {
  readonly id: string;
  readonly name: (messages: Messages) => string;
  readonly action: CommandAction<Route, R>;
};

/** The shell's commands: open the view, copy the diagnostics report. */
export const shellCommands: readonly PluginCommand<
  { readonly shell: ShellCatalog },
  never,
  ShellServices
>[] = [
  {
    id: "open-view",
    name: (messages) => messages.shell.commands.openView,
    action: { _tag: "open" },
  },
  {
    id: "copy-diagnostics",
    name: (messages) => messages.shell.commands.copyDiagnostics,
    action: { _tag: "run", effect: copyDiagnostics },
  },
];
