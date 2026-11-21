import { Effect, Layer } from "effect";
import type { Plugin } from "obsidian";
import { DeviceStore, type DeviceValue } from "../../../application/shell";

/** What the adapter stores: an envelope, because Obsidian clears a key saved with a falsy value. */
type Envelope = { readonly value: DeviceValue };

const isEnvelope = (stored: unknown): stored is Envelope =>
  typeof stored === "object" && stored !== null && !Array.isArray(stored) && "value" in stored;

/**
 * `DeviceStore` over Obsidian's vault-scoped local storage (`app.loadLocalStorage`): per device and
 * vault, not synced. Keys are prefixed with the plugin id, because other plugins share the storage.
 * Obsidian's calls swallow their own errors (a full quota, broken JSON), so neither call fails.
 */
export const deviceStoreLayer = (plugin: Plugin) => {
  const { app, manifest } = plugin;
  const keyOf = (key: string) => `${manifest.id}/${key}`;
  return Layer.succeed(DeviceStore)({
    read: (key) =>
      Effect.sync(() => {
        const stored: unknown = app.loadLocalStorage(keyOf(key));
        return isEnvelope(stored) ? stored.value : undefined;
      }),
    write: (key, value) =>
      Effect.sync(() => {
        app.saveLocalStorage(keyOf(key), value === undefined ? null : { value });
      }),
  });
};
