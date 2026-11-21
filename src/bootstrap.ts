import { Effect } from "effect";
import type { Plugin } from "obsidian";
import type { AppRuntime } from "./application/app-services";
import { reportDefect } from "./application/defects";
import { Logger } from "./application/ports";
import { SettingsService } from "./application/settings-service";
import { describeDefect } from "./application/user-messages";
import { consoleSink } from "./infrastructure/logging/console-sink";
import { appLayer } from "./infrastructure/obsidian/app-layer";
import { registerCommands } from "./infrastructure/obsidian/commands";
import { showMessage } from "./infrastructure/obsidian/notices";
import { RIBBON_ICON, RIBBON_TITLE, releaseRibbonIcon } from "./infrastructure/obsidian/ribbon";
import { runSafely } from "./infrastructure/obsidian/run";
import { mirrorSettings } from "./infrastructure/obsidian/settings-mirror";
import { ShellSettingTab } from "./infrastructure/obsidian/settings-tab";
import { SHELL_VIEW_TYPE, ShellView } from "./infrastructure/obsidian/shell-view";
import { makeRuntime } from "./infrastructure/runtime";
import { releaseAll } from "./presentation/release";

export { SHELL_VIEW_TYPE } from "./infrastructure/obsidian/shell-view";

export type BootstrapHandle = {
  readonly runtime: AppRuntime;
  /**
   * Re-reads `data.json` after it changed outside Obsidian, then refreshes the settings tab.
   * Open views follow through `SettingsService.changes` and `statusChanges`. Never rejects.
   */
  reloadSettings(): Promise<void>;
  dispose(): Promise<void>;
};

export type BootstrapOptions = { readonly signal?: AbortSignal };

const log = (runtime: AppRuntime, event: string) =>
  runSafely(
    runtime,
    Logger.use((logger) => logger.log({ level: "info", event })),
  );

const openView = async (plugin: Plugin): Promise<void> => {
  const { workspace } = plugin.app;
  const existing = workspace.getLeavesOfType(SHELL_VIEW_TYPE)[0];
  const leaf = existing ?? workspace.getLeaf(true);
  if (existing === undefined) await leaf.setViewState({ type: SHELL_VIEW_TYPE, active: true });
  await workspace.revealLeaf(leaf);
};

/**
 * Wires one plugin load: runtime, ribbon, commands, settings tab, view. If the plugin is unloaded
 * while settings are still loading (`signal` aborted), it registers nothing. If a registration
 * throws, everything created so far is released, a defect message is shown and the error rethrown.
 */
export const bootstrap = async (
  plugin: Plugin,
  options: BootstrapOptions = {},
): Promise<BootstrapHandle> => {
  const runtime = makeRuntime(
    appLayer(plugin, { developmentMode: import.meta.env.MODE === "development" }),
  );
  // A function, not a value: the signal can flip while bootstrap awaits.
  const aborted = () => options.signal?.aborted === true;
  const undo: (() => unknown)[] = [];
  let started = false;
  let disposed = false;
  const dispose = async () => {
    disposed = true;
    // Undo in reverse order, one step after the other. A failing step does not stop the others
    // or the runtime; the first error is rethrown once everything is released.
    const errors: unknown[] = [];
    await undo
      .splice(0)
      .toReversed()
      .reduce<Promise<unknown>>(
        (previous, step) =>
          previous.then(async () => {
            try {
              await step();
            } catch (error) {
              errors.push(error);
            }
          }),
        Promise.resolve(),
      );
    await runtime.dispose();
    if (errors.length > 0) throw errors[0];
  };
  try {
    const inert = async (): Promise<BootstrapHandle> => {
      await dispose();
      return { runtime, reloadSettings: async () => undefined, dispose: async () => undefined };
    };
    const mirror = await mirrorSettings(runtime);
    undo.push(() => mirror.stop());
    if (aborted()) return await inert();
    const open = () =>
      runSafely(
        runtime,
        Effect.promise(() => openView(plugin)),
      );
    // Added once; the user can hide it from the ribbon's context menu. Only a failed bootstrap
    // removes its ribbon icon and commands. On a normal unload Obsidian removes them itself, and
    // removing by id here could hit those of a quick re-enable.
    const ribbon = plugin.addRibbonIcon(RIBBON_ICON, RIBBON_TITLE, () => open());
    undo.push(() => {
      if (!started) releaseRibbonIcon(plugin, ribbon);
    });
    const removeCommands = registerCommands(plugin, runtime, () => open().then(() => undefined));
    undo.push(() => {
      if (!started) removeCommands();
    });
    const tab = new ShellSettingTab(plugin.app, plugin, runtime, mirror);
    plugin.addSettingTab(tab);
    const surfaces = new Set<() => void>();
    plugin.registerView(SHELL_VIEW_TYPE, (leaf) => new ShellView(leaf, runtime, surfaces));
    // Runs first on dispose: every open view releases its Vue app before the runtime goes.
    undo.push(() => {
      const closes = [...surfaces];
      surfaces.clear();
      releaseAll(closes);
    });
    await log(runtime, "plugin.loaded");
    started = true;
    const reloadSettings = async () => {
      if (disposed) return;
      await runSafely(
        runtime,
        SettingsService.use((service) => service.reload),
      );
      await mirror.refresh().catch(() => undefined);
      tab.update();
    };
    return { runtime, reloadSettings, dispose };
  } catch (error) {
    await runtime.runPromise(reportDefect(error)).catch(() => reportUnloadFailure(error));
    await dispose().catch(() => undefined);
    throw error;
  }
};

/** Last resort when the runtime itself is unusable: show the defect message directly. */
export const reportUnloadFailure = (cause: unknown): void => {
  const incidentId = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, "0");
  consoleSink.write({
    level: "error",
    event: "plugin.unload.failed",
    context: { cause: String(cause) },
    incidentId,
  });
  showMessage(describeDefect(incidentId));
};
