import { Effect, Layer } from "effect";
import { Notice, Platform, apiVersion, type Plugin } from "obsidian";
import { ClipboardError, StorageError, VaultReadError } from "../../application/errors";
import { Clipboard, HostInfo, Notifier, SettingsStore, VaultReader } from "../../application/ports";
import type { UserMessage } from "../../application/user-messages";

/** Milliseconds a notice stays visible; errors need time to read and act on. */
export const NOTICE_DURATION = { info: 4000, warning: 8000, error: 12000 } as const;

/** Builds the notice body with DOM APIs only (no innerHTML). */
const messageFragment = (message: UserMessage): DocumentFragment =>
  createFragment((fragment) => {
    fragment.createEl("strong", { text: message.title });
    if (message.detail !== "") fragment.createDiv({ text: message.detail });
  });

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
  notify: (message: UserMessage) =>
    Effect.asVoid(
      Effect.sync(() => new Notice(messageFragment(message), NOTICE_DURATION[message.severity])),
    ),
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

/** The Obsidian adapters for every port that touches the host. */
export const obsidianLayer = (plugin: Plugin) =>
  Layer.mergeAll(
    storeLayer(plugin),
    notifierLayer,
    vaultLayer(plugin),
    clipboardLayer,
    hostLayer(plugin),
  );
