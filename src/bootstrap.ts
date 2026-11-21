import { Effect } from "effect";
import type { Plugin } from "obsidian";
import type { AppRuntime } from "./application/app-services";
import { catalogFor } from "./application/messages";
import {
  Logger,
  Messages,
  SettingsService,
  describeDefect,
  reportDefect,
  toLoggedError,
} from "./application/shell";
import { consoleSink } from "./infrastructure/logging/console-sink";
import { appLayer } from "./infrastructure/obsidian/app-layer";
import {
  SHELL_VIEW_TYPE,
  ShellSettingTab,
  ShellView,
  addRibbonIcon,
  hostLanguage,
  mirrorSettings,
  registerCommands,
  runSafely,
  showMessage,
} from "./infrastructure/obsidian/shell";
import { makeRuntime } from "./infrastructure/runtime";
import { appSurface } from "./presentation/app-surface";
import { releaseAll } from "./presentation/shell/host";

export { SHELL_VIEW_TYPE } from "./infrastructure/obsidian/shell";

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
 * Wires one plugin load: runtime, commands, ribbon, settings tab, view. If the plugin is unloaded
 * while settings are still loading (`signal` aborted), it registers nothing. If a registration
 * throws, everything created so far is released, a defect message is shown and the error rethrown.
 */
export const bootstrap = async (
  plugin: Plugin,
  options: BootstrapOptions = {},
): Promise<BootstrapHandle> => {
  const runtime = makeRuntime(
    appLayer(plugin, {
      developmentMode: import.meta.env.MODE === "development",
      language: hostLanguage(),
    }),
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
    const messages = await runtime.runPromise(Messages.useSync((catalog) => catalog.shell));
    const open = () =>
      runSafely(
        runtime,
        Effect.promise(() => openView(plugin)),
      );
    const removeCommands = registerCommands(plugin, runtime, messages, () =>
      open().then(() => undefined),
    );
    undo.push(() => {
      if (!started) removeCommands();
    });
    const tab = new ShellSettingTab(plugin.app, plugin, runtime, mirror, messages);
    // Added after everything that can fail, right before the final registrations: Obsidian
    // removes it on a normal unload, but not after a failed onload. The user can hide it from the
    // ribbon's context menu.
    addRibbonIcon(plugin, open);
    plugin.addSettingTab(tab);
    const surfaces = new Set<() => void>();
    plugin.registerView(
      SHELL_VIEW_TYPE,
      (leaf) => new ShellView(leaf, runtime, surfaces, appSurface),
    );
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

/**
 * Last resort when the runtime itself is unusable: show the defect message directly, in the
 * language Obsidian uses now.
 */
export const reportUnloadFailure = (cause: unknown): void => {
  const incidentId = Math.random().toString(36).slice(2, 8).toUpperCase().padEnd(6, "0");
  consoleSink.write({
    level: "error",
    event: "plugin.unload.failed",
    error: toLoggedError(cause),
    incidentId,
  });
  showMessage(describeDefect(incidentId, catalogFor(hostLanguage()).shell));
};
