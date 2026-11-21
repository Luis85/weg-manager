import { Context, Effect, Equal, Layer, Option, SubscriptionRef, type Stream } from "effect";
import {
  DEFAULT_SETTINGS,
  decodeSettings,
  validatePatch,
  type DecodedSettings,
  type EditableSettings,
  type Settings,
} from "../domain/settings";
import { InvalidSettingsError, ReadOnlySettingsError, type UpdateSettingsError } from "./errors";
import { Notifier, SettingsStore } from "./ports";
import { describeError, describeSettingsIssues, type UserMessage } from "./user-messages";

export type ReadOnlyReason = ReadOnlySettingsError["reason"];

export type SettingsStatus = {
  readonly writable: boolean;
  readonly issues: readonly string[];
  readonly readOnlyReason?: ReadOnlyReason;
};

// Stryker disable StringLiteral: a service key only has to be unique; tests cannot observe its text.
export class SettingsService extends Context.Service<
  SettingsService,
  {
    readonly current: Effect.Effect<Settings>;
    readonly status: Effect.Effect<SettingsStatus>;
    update(patch: Partial<EditableSettings>): Effect.Effect<Settings, UpdateSettingsError>;
    /**
     * Reads the store again (after Sync or another program changed `data.json`), publishes new
     * values through `changes` and a new status through `statusChanges`. Never fails: an unreadable
     * or newer file switches to read-only, as on load. Unchanged values publish nothing.
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

const toLoaded = (decoded: DecodedSettings): Loaded =>
  decoded.writable ? decoded : { ...decoded, readOnlyReason: "newer-version" };

const loadMessage = (loaded: Loaded): UserMessage | undefined => {
  if (loaded.readOnlyReason !== undefined) {
    return describeError(new ReadOnlySettingsError({ reason: loaded.readOnlyReason }));
  }
  return loaded.issues.length > 0 ? describeSettingsIssues(loaded.issues) : undefined;
};

const toStatus = (loaded: Loaded): SettingsStatus =>
  loaded.readOnlyReason === undefined
    ? { writable: loaded.writable, issues: loaded.issues }
    : { writable: false, issues: loaded.issues, readOnlyReason: loaded.readOnlyReason };

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
    const read = store.load.pipe(
      Effect.map((raw) => toLoaded(decodeSettings(raw))),
      Effect.catchTag("StorageError", () => Effect.succeed(unreadable)),
    );
    const announce = (loaded: Loaded) => {
      const message = loadMessage(loaded);
      return message === undefined ? Effect.void : notifier.notify(message);
    };
    const loaded = yield* read;
    yield* announce(loaded);

    const ref = yield* SubscriptionRef.make(loaded.settings);
    const statusRef = yield* SubscriptionRef.make(toStatus(loaded));

    const update = (patch: Partial<EditableSettings>) =>
      SubscriptionRef.modifyEffect(ref, (current) =>
        Effect.gen(function* () {
          const { readOnlyReason } = yield* SubscriptionRef.get(statusRef);
          if (readOnlyReason !== undefined) {
            return yield* new ReadOnlySettingsError({ reason: readOnlyReason });
          }
          const result = validatePatch(current, patch);
          if (!result.ok) return yield* new InvalidSettingsError({ issues: result.issues });
          yield* store.save(result.settings);
          return [result.settings, result.settings] as const;
        }),
      );

    const reload = SubscriptionRef.modifySomeEffect(ref, (current) =>
      Effect.gen(function* () {
        const next = yield* read;
        const status = toStatus(next);
        const previous = yield* SubscriptionRef.get(statusRef);
        if (!Equal.equals(previous, status)) {
          yield* SubscriptionRef.set(statusRef, status);
          yield* announce(next);
        }
        const changed = !Equal.equals(current, next.settings);
        return [undefined, changed ? Option.some(next.settings) : Option.none()] as const;
      }),
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
