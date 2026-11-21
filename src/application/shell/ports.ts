// Stryker disable StringLiteral: the only strings here are service keys; they only have to be unique and tests cannot observe their text.
import { Context, type Effect } from "effect";
import type { LogLevel } from "../../domain/shell";
import type { ClipboardError, StorageError, VaultReadError } from "./errors";
import type { Catalog } from "../messages";
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

/**
 * What the log keeps of a thrown cause. `name` is a strict identifier and `frames` hold no path
 * or file name beyond a last path segment, so both may appear in the diagnostics report. `message`
 * is raw and reaches the console sink only.
 */
export type LoggedError = {
  readonly name: string;
  readonly message: string;
  readonly frames: readonly string[];
};

export type LogEntry = {
  readonly level: LogLevel;
  /** Stable dotted name, e.g. `settings.load.failed`. Anything categorical belongs here. */
  readonly event: string;
  /** Counts and flags only. No strings: the diagnostics report prints this as it is. */
  readonly data?: Readonly<Record<string, number | boolean>>;
  readonly error?: LoggedError;
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
 * The message catalog of the UI language with every module's part (`src/application/messages.ts`).
 * The host picks it once per plugin load (Obsidian restarts when its language changes), so it is a
 * value, not a stream.
 */
export class Messages extends Context.Service<Messages, Catalog>()(
  "weg-manager/application/Messages",
) {}

/** A JSON value, small enough for local storage. */
export type DeviceValue =
  | null
  | boolean
  | number
  | string
  | readonly DeviceValue[]
  | { readonly [key: string]: DeviceValue };

/**
 * Small values kept per device and vault, never in `data.json`, so Sync does not carry them to
 * another device (ADR 0008). The community selection is the first. A read returns `undefined` for a
 * key never written or cleared; the caller decodes what it reads with its schema, because an
 * earlier plugin version may have written it. Neither call fails: Obsidian's local storage
 * swallows its own errors, and a value that is lost only costs a choice the user makes again.
 */
export class DeviceStore extends Context.Service<
  DeviceStore,
  {
    read(key: string): Effect.Effect<unknown>;
    /** Stores a copy of `value`; `undefined` clears the key. */
    write(key: string, value: DeviceValue | undefined): Effect.Effect<void>;
  }
>()("weg-manager/application/DeviceStore") {}
