// Stryker disable StringLiteral: the only strings here are service keys; they only have to be unique and tests cannot observe their text.
import { Context, type Effect } from "effect";
import type { LogLevel } from "../domain/settings";
import type { ClipboardError, StorageError, VaultReadError } from "./errors";
import type { Catalog } from "./i18n";
import type { UserMessage } from "./user-messages";

/** Raw persistence of `data.json`. */
export class SettingsStore extends Context.Service<
  SettingsStore,
  {
    readonly load: Effect.Effect<unknown, StorageError>;
    save(data: unknown): Effect.Effect<void, StorageError>;
  }
>()("weg-manager/application/SettingsStore") {}

/** Shows a message to the user (an Obsidian `Notice` in the plugin). */
export class Notifier extends Context.Service<
  Notifier,
  { notify(message: UserMessage): Effect.Effect<void> }
>()("weg-manager/application/Notifier") {}

export class VaultReader extends Context.Service<
  VaultReader,
  { readonly markdownFileCount: Effect.Effect<number, VaultReadError> }
>()("weg-manager/application/VaultReader") {}

export type LogEntry = {
  readonly level: LogLevel;
  /** Stable dotted name, e.g. `settings.load.failed`. */
  readonly event: string;
  readonly context?: Readonly<Record<string, unknown>>;
  readonly incidentId?: string;
};

export type RecordedLogEntry = LogEntry & { readonly at: number };

export class Logger extends Context.Service<
  Logger,
  {
    log(entry: LogEntry): Effect.Effect<void>;
    readonly recent: Effect.Effect<readonly RecordedLogEntry[]>;
  }
>()("weg-manager/application/Logger") {}

/** Where accepted log entries go (the console in the plugin). Synchronous and must not throw. */
export class LogSink extends Context.Service<LogSink, { write(entry: LogEntry): void }>()(
  "weg-manager/application/LogSink",
) {}

export class Incidents extends Context.Service<
  Incidents,
  { readonly nextId: Effect.Effect<string> }
>()("weg-manager/application/Incidents") {}

export class Clipboard extends Context.Service<
  Clipboard,
  { write(text: string): Effect.Effect<void, ClipboardError> }
>()("weg-manager/application/Clipboard") {}

export class HostInfo extends Context.Service<
  HostInfo,
  { readonly pluginVersion: string; readonly apiVersion: string; readonly platform: string }
>()("weg-manager/application/HostInfo") {}

/**
 * The message catalog of the UI language. The host picks it once per plugin load (Obsidian
 * restarts when its language changes), so it is a value, not a stream.
 */
export class Messages extends Context.Service<Messages, Catalog>()(
  "weg-manager/application/Messages",
) {}
