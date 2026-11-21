import { Context, Effect, Layer, SubscriptionRef, type Stream } from "effect";
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
    /** Emits the current value first, then every change. */
    readonly changes: Stream.Stream<Settings>;
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
 * Loads settings once. Building never fails: an unreadable store or a newer file loads defaults
 * read-only and is never written. Updates are serialised, so saves happen in call order.
 */
export const SettingsServiceLive = Layer.effect(
  SettingsService,
  Effect.gen(function* () {
    const store = yield* SettingsStore;
    const notifier = yield* Notifier;
    const loaded = yield* store.load.pipe(
      Effect.map((raw) => toLoaded(decodeSettings(raw))),
      Effect.catchTag("StorageError", () => Effect.succeed(unreadable)),
    );
    const message = loadMessage(loaded);
    if (message !== undefined) yield* notifier.notify(message);

    const ref = yield* SubscriptionRef.make(loaded.settings);
    const status = toStatus(loaded);

    const update = (patch: Partial<EditableSettings>) =>
      SubscriptionRef.modifyEffect(ref, (current) =>
        Effect.gen(function* () {
          if (status.readOnlyReason !== undefined) {
            return yield* new ReadOnlySettingsError({ reason: status.readOnlyReason });
          }
          const result = validatePatch(current, patch);
          if (!result.ok) return yield* new InvalidSettingsError({ issues: result.issues });
          yield* store.save(result.settings);
          return [result.settings, result.settings] as const;
        }),
      );

    return SettingsService.of({
      current: SubscriptionRef.get(ref),
      status: Effect.succeed(status),
      update,
      changes: SubscriptionRef.changes(ref),
    });
  }),
);
