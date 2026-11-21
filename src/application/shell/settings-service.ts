import { Context, Effect, Equal, Layer, Semaphore, SubscriptionRef, type Stream } from "effect";
import {
  DEFAULT_SETTINGS,
  decodeSettings,
  encodeSettings,
  validatePatch,
  type DecodedSettings,
  type EditableSettings,
  type Settings,
  type SettingsIssue,
} from "../../domain/shell";
import { InvalidSettingsError, ReadOnlySettingsError, type UpdateSettingsError } from "./errors";
import type { ShellCatalog } from "./i18n/catalog";
import { Messages, Notifier, SettingsStore } from "./ports";
import { describeSettingsIssues, describeShellError, type UserMessage } from "./user-messages";

export type ReadOnlyReason = ReadOnlySettingsError["reason"];

export type SettingsStatus = {
  readonly writable: boolean;
  readonly issues: readonly SettingsIssue[];
  readonly readOnlyReason?: ReadOnlyReason;
};

// Stryker disable StringLiteral: a service key only has to be unique; tests cannot observe its text.
export class SettingsService extends Context.Service<
  SettingsService,
  {
    readonly current: Effect.Effect<Settings>;
    readonly status: Effect.Effect<SettingsStatus>;
    /** Validates and saves a patch. Once the save has started, an interruption waits for it. */
    update(patch: Partial<EditableSettings>): Effect.Effect<Settings, UpdateSettingsError>;
    /**
     * Reads the store again (after Sync or another program changed `data.json`), publishes new
     * values through `changes` and a new status through `statusChanges`. Never fails: an unreadable
     * or newer file switches to read-only, as on load. Unchanged values publish nothing. Once the
     * file is read, an interruption waits until status, notice and settings are all applied.
     */
    readonly reload: Effect.Effect<void>;
    /** Emits the current value first, then every change. */
    readonly changes: Stream.Stream<Settings>;
    /** Emits the current status first, then every change (only `reload` changes it). */
    readonly statusChanges: Stream.Stream<SettingsStatus>;
  }
>()("weg-manager/application/SettingsService") {}
// Stryker restore StringLiteral

type Loaded = DecodedSettings & { readonly readOnlyReason?: ReadOnlyReason };

const unreadable: Loaded = {
  settings: DEFAULT_SETTINGS,
  issues: [],
  writable: false,
  readOnlyReason: "unreadable",
};

const loadMessage = (loaded: Loaded, messages: ShellCatalog): UserMessage | undefined => {
  if (loaded.readOnlyReason !== undefined) {
    return describeShellError(
      new ReadOnlySettingsError({ reason: loaded.readOnlyReason }),
      messages,
    );
  }
  return loaded.issues.length > 0 ? describeSettingsIssues(loaded.issues, messages) : undefined;
};

const toStatus = (loaded: Loaded): SettingsStatus =>
  loaded.readOnlyReason === undefined
    ? { writable: loaded.writable, issues: loaded.issues }
    : { writable: loaded.writable, issues: loaded.issues, readOnlyReason: loaded.readOnlyReason };

/**
 * Loads settings on build and again on every `reload`. Neither ever fails: an unreadable store or a
 * newer file loads defaults read-only and is never written. Updates and reloads are serialised, so
 * saves happen in call order and a reload never interleaves with a save.
 */
export const SettingsServiceLive = Layer.effect(
  SettingsService,
  Effect.gen(function* () {
    const store = yield* SettingsStore;
    const notifier = yield* Notifier;
    const { shell: messages } = yield* Messages;
    const read = store.load.pipe(
      Effect.map((raw): Loaded => decodeSettings(raw)),
      Effect.catchTag("StorageError", () => Effect.succeed(unreadable)),
    );
    const announce = (loaded: Loaded) => {
      const message = loadMessage(loaded, messages);
      return message === undefined ? Effect.void : notifier.notify(message);
    };
    const loaded = yield* read;
    yield* announce(loaded);

    const ref = yield* SubscriptionRef.make(loaded.settings);
    const statusRef = yield* SubscriptionRef.make(toStatus(loaded));
    /**
     * Serialises updates and reloads. Waiting for it stays interruptible: nothing has changed yet.
     * What follows a save or a read runs uninterruptibly, because `plugin.saveData` cannot be
     * cancelled: an interruption there would leave the file and every view out of step.
     */
    const lock = yield* Semaphore.make(1);

    const update = (patch: Partial<EditableSettings>) =>
      lock.withPermit(
        Effect.gen(function* () {
          const { readOnlyReason } = yield* SubscriptionRef.get(statusRef);
          if (readOnlyReason !== undefined) {
            return yield* new ReadOnlySettingsError({ reason: readOnlyReason });
          }
          const result = validatePatch(yield* SubscriptionRef.get(ref), patch);
          if (!result.ok) return yield* new InvalidSettingsError({ issues: result.issues });
          const { settings } = result;
          return yield* Effect.uninterruptible(
            store
              .save(encodeSettings(settings))
              .pipe(Effect.andThen(SubscriptionRef.set(ref, settings)), Effect.as(settings)),
          );
        }),
      );

    const apply = (next: Loaded) =>
      Effect.gen(function* () {
        const status = toStatus(next);
        if (!Equal.equals(yield* SubscriptionRef.get(statusRef), status)) {
          yield* SubscriptionRef.set(statusRef, status);
          yield* announce(next);
        }
        if (!Equal.equals(yield* SubscriptionRef.get(ref), next.settings)) {
          yield* SubscriptionRef.set(ref, next.settings);
        }
      });

    const reload = lock.withPermit(
      Effect.flatMap(read, (next) => Effect.uninterruptible(apply(next))),
    );

    return SettingsService.of({
      current: SubscriptionRef.get(ref),
      status: SubscriptionRef.get(statusRef),
      update,
      reload,
      changes: SubscriptionRef.changes(ref),
      statusChanges: SubscriptionRef.changes(statusRef),
    });
  }),
);
