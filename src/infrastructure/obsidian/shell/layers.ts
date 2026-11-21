import { Effect, Layer } from "effect";
import { Platform, apiVersion, type Plugin } from "obsidian";
import { messagesLayer } from "../../../application/messages";
import {
  ClipboardError,
  StorageError,
  VaultReadError,
  type Language,
  type UserMessage,
  Clipboard,
  HostInfo,
  Notifier,
  SettingsStore,
  VaultReader,
} from "../../../application/shell";
import { deviceStoreLayer } from "./device-store";
import { showMessage } from "./notices";

export { NOTICE_DURATION } from "./notices";

const platformName = (): string => {
  const kind = Platform.isMobile ? "mobile" : "desktop";
  if (Platform.isMacOS) return `${kind}-macos`;
  if (Platform.isWin) return `${kind}-windows`;
  if (Platform.isLinux) return `${kind}-linux`;
  if (Platform.isIosApp) return `${kind}-ios`;
  return Platform.isAndroidApp ? `${kind}-android` : kind;
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

const vaultLayer = (plugin: Plugin) =>
  Layer.succeed(VaultReader)({
    markdownFileCount: Effect.try({
      try: () => plugin.app.vault.getMarkdownFiles().length,
      catch: (cause) => new VaultReadError({ cause }),
    }),
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

/**
 * The Obsidian adapters for every port that touches the host. `language` is the UI language of
 * this plugin load (`hostLanguage()`); it picks the `Messages` catalog.
 */
export const obsidianLayer = (plugin: Plugin, language: Language) =>
  Layer.mergeAll(
    storeLayer(plugin),
    notifierLayer,
    vaultLayer(plugin),
    clipboardLayer,
    hostLayer(plugin),
    messagesLayer(language),
    deviceStoreLayer(plugin),
  );
