import { Effect, Layer } from "effect";
import { Platform, apiVersion, type Plugin } from "obsidian";
import type { AppAdapters } from "../../../application/app-services-layer";
import {
  ClipboardError,
  StorageError,
  type UserMessage,
  Clipboard,
  HostInfo,
  Notifier,
  SettingsStore,
} from "../../../application/shell";
import { consoleSinkLayer } from "../../logging/console-sink";
import { incidentsLayer } from "../../logging/incidents";
import { deviceStoreLayer } from "./device-store";
import { hostEventsLayer } from "./events";
import { showMessage } from "./notices";

export { NOTICE_DURATION } from "./notices";

/**
 * The app flags come first: Obsidian sets `isMacOS` on iPhones and iPads too ("a device that
 * pretends to be one"), and an Android device may say Linux.
 */
const platformName = (): string => {
  const kind = Platform.isMobile ? "mobile" : "desktop";
  if (Platform.isIosApp) return `${kind}-ios`;
  if (Platform.isAndroidApp) return `${kind}-android`;
  if (Platform.isMacOS) return `${kind}-macos`;
  if (Platform.isWin) return `${kind}-windows`;
  return Platform.isLinux ? `${kind}-linux` : kind;
};

const storeLayer = (plugin: Plugin) =>
  Layer.succeed(SettingsStore)({
    load: Effect.tryPromise({
      try: (): Promise<unknown> => plugin.loadData(),
      catch: (cause) => new StorageError({ cause }),
    }),
    save: (data: unknown) =>
      Effect.tryPromise({
        try: () => plugin.saveData(data),
        catch: (cause) => new StorageError({ cause }),
      }),
  });

const notifierLayer = Layer.succeed(Notifier)({
  notify: (message: UserMessage) => Effect.asVoid(Effect.sync(() => showMessage(message))),
});

const clipboardLayer = Layer.succeed(Clipboard)({
  write: (text: string) =>
    Effect.tryPromise({
      try: () => navigator.clipboard.writeText(text),
      catch: (cause) => new ClipboardError({ cause }),
    }),
});

const hostLayer = (plugin: Plugin) =>
  Layer.succeed(HostInfo)({
    pluginVersion: plugin.manifest.version,
    apiVersion,
    platform: platformName(),
  });

/** The shell's ports that the Obsidian adapters serve. */
export type ShellAdapters = Pick<
  AppAdapters,
  | "settingsStore"
  | "notifier"
  | "clipboard"
  | "hostInfo"
  | "deviceStore"
  | "incidents"
  | "logSink"
  | "hostEvents"
>;

/**
 * The Obsidian adapters of the shell's ports for one plugin load: `data.json`, notices, the
 * clipboard, host info, the vault's local storage, incident ids, the console, and the host event
 * adapter, which `appServicesLayer` builds last.
 */
export const shellAdapters = (plugin: Plugin): ShellAdapters => ({
  settingsStore: storeLayer(plugin),
  notifier: notifierLayer,
  clipboard: clipboardLayer,
  hostInfo: hostLayer(plugin),
  deviceStore: deviceStoreLayer(plugin),
  incidents: incidentsLayer,
  logSink: consoleSinkLayer,
  hostEvents: hostEventsLayer(plugin),
});
