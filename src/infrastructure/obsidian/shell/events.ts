import { Duration, Effect, Layer, Option, Queue } from "effect";
import { TFile, type EventRef, type Events, type Plugin, type TAbstractFile } from "obsidian";
import { AppEvent } from "../../../application/events";
import {
  EventBus,
  Logger,
  reportUnexpected,
  type Incidents,
  type Messages,
  type Notifier,
} from "../../../application/shell";
import { cacheCompleteness } from "./cache-completeness";

/**
 * How long the metadata cache may stay silent, with files still missing from it, before
 * `VaultReady` is published anyway. It runs from the layout being ready and starts again at every
 * `resolved`, which Obsidian fires after each file it indexes: a cold start on the reference vault
 * fires one about every millisecond (`vault-ready.e2e.ts`: 2,200 notes in about 2.6 s), so a vault
 * that is still being indexed never reaches it, however large; one file that Obsidian does not get
 * to is what it waits for. Ten seconds is many times the gap between two files of a working
 * indexer, and a view that waits for the index costs the user no more than that.
 */
export const VAULT_READY_DEADLINE = Duration.seconds(10);

const ifFile =
  (make: (file: TFile) => AppEvent) =>
  (file: TAbstractFile): AppEvent | undefined =>
    file instanceof TFile ? make(file) : undefined;

const pathAndExtension = (file: TFile) => ({ path: file.path, extension: file.extension });

/**
 * Publishes Obsidian's vault, metadata-cache and workspace events as `AppEvent`s for one runtime.
 *
 * - Host events are held back until the layout is ready (Obsidian fires `create` for every
 *   existing file while it starts); then `LayoutReady` is published first.
 * - `VaultReady` follows once the metadata cache holds every Markdown file (`cacheCompleteness`),
 *   checked when the layout is ready and on every `resolved` (which also follows a delete), and is
 *   published once. After a warm restart and in a running app it comes right after `LayoutReady`;
 *   on a cold start with the `resolved` after the last file Obsidian indexes.
 * - A file that Obsidian never indexes would hold it back for good, so after
 *   `VAULT_READY_DEADLINE` without a `resolved` it is published anyway and the number of files
 *   missing is logged once, without paths (`vault.ready.fallback`). The note index then builds
 *   with what the cache holds and follows the file's `MetadataChanged` if Obsidian indexes it
 *   later. The wait is a fiber of the runtime's scope, so unloading ends it.
 * - Every listener is also handed to `plugin.registerEvent`, so Obsidian detaches it synchronously
 *   in `unload()`, before the runtime's asynchronous dispose has finished.
 * - Every listener is removed with `offref` when the runtime's scope closes, so a bootstrap that
 *   fails or is aborted leaves nothing behind even though the plugin itself is not unloaded.
 *   Obsidian's `offref` removes a ref by identity and ignores one that is already gone, so the
 *   second release is harmless.
 * - Mapping and publishing run synchronously inside Obsidian's callback. A defect goes to
 *   `reportDefect` and never throws into Obsidian.
 */
export const hostEventsLayer = (plugin: Plugin) =>
  Layer.effectDiscard(
    Effect.gen(function* () {
      const bus = yield* EventBus;
      const logger = yield* Logger;
      const context = yield* Effect.context<Logger | Incidents | Notifier | Messages>();
      const { vault, metadataCache, workspace } = plugin.app;
      let ready = false;
      let vaultReady = false;
      let active = true;
      const cache = cacheCompleteness(vault, metadataCache);
      /** A sign that the cache moved or the layout became ready, for the deadline's fiber. */
      const progress = yield* Queue.sliding<void>(1);

      const publish = (build: () => AppEvent | undefined): void => {
        const program = Effect.suspend(() => {
          const event = build();
          return event === undefined ? Effect.void : bus.publish(event);
        }).pipe(Effect.catchCause(reportUnexpected));
        // The exit is dropped: it is a failure only if the defect path itself failed.
        Effect.runSyncExitWith(context)(program);
      };
      const whenReady =
        <Args extends unknown[]>(build: (...args: Args) => AppEvent | undefined) =>
        (...args: Args): void => {
          if (ready) publish(() => build(...args));
        };
      const readiness = (): AppEvent | undefined => {
        if (vaultReady || !cache.complete()) return undefined;
        vaultReady = true;
        return AppEvent.VaultReady();
      };
      const checkReadiness = (): void => {
        if (!ready || vaultReady) return;
        publish(readiness);
        if (!vaultReady) Queue.offerUnsafe(progress, undefined);
      };
      /** `VaultReady` although the cache is incomplete: the deadline has passed. */
      const giveUpWaiting = Effect.suspend(() => {
        if (vaultReady) return Effect.void;
        const missing = cache.missing();
        vaultReady = true;
        return Effect.andThen(
          missing === 0
            ? Effect.void
            : logger.log({ level: "warn", event: "vault.ready.fallback", data: { missing } }),
          bus.publish(AppEvent.VaultReady()),
        );
      }).pipe(Effect.catchCause(reportUnexpected), Effect.provideContext(context));

      yield* Effect.acquireRelease(
        Effect.sync((): readonly (readonly [Events, EventRef])[] => [
          [
            vault,
            vault.on(
              "create",
              whenReady(ifFile((file) => AppEvent.FileCreated(pathAndExtension(file)))),
            ),
          ],
          [
            vault,
            vault.on(
              "modify",
              whenReady(ifFile((file) => AppEvent.FileModified(pathAndExtension(file)))),
            ),
          ],
          [
            vault,
            vault.on(
              "delete",
              whenReady(ifFile((file) => AppEvent.FileDeleted(pathAndExtension(file)))),
            ),
          ],
          [
            vault,
            vault.on(
              "rename",
              whenReady((file: TAbstractFile, oldPath: string) =>
                ifFile((renamed) =>
                  AppEvent.FileRenamed({ ...pathAndExtension(renamed), oldPath }),
                )(file),
              ),
            ),
          ],
          [
            metadataCache,
            metadataCache.on(
              "changed",
              whenReady((file: TFile) => AppEvent.MetadataChanged(pathAndExtension(file))),
            ),
          ],
          [metadataCache, metadataCache.on("resolved", checkReadiness)],
        ]).pipe(
          Effect.tap((refs) =>
            Effect.sync(() => {
              for (const [, ref] of refs) plugin.registerEvent(ref);
            }),
          ),
        ),
        (refs) =>
          Effect.sync(() => {
            active = false;
            for (const [emitter, ref] of refs) emitter.offref(ref);
          }),
      );

      // Once the layout is ready with files missing, each `resolved` is a sign of life. The first
      // wait has no deadline: it ends with the layout, and never ends when the cache is complete.
      const waitForSigns: Effect.Effect<void> = Effect.suspend(() =>
        vaultReady
          ? Effect.void
          : Effect.flatMap(
              Effect.timeoutOption(Queue.take(progress), VAULT_READY_DEADLINE),
              (sign) => (Option.isNone(sign) ? giveUpWaiting : waitForSigns),
            ),
      );
      yield* Effect.forkScoped(Effect.andThen(Queue.take(progress), waitForSigns));

      // Obsidian cannot cancel this callback, so it checks that the runtime is still alive.
      workspace.onLayoutReady(() => {
        if (!active) return;
        ready = true;
        publish(() => AppEvent.LayoutReady());
        checkReadiness();
      });
    }),
  );
