import { Effect, Layer, ManagedRuntime, Option, Stream } from "effect";
import type { Plugin } from "obsidian";
import type { AppEvent } from "../../../src/application/events";
import {
  noteChanges,
  noteIndexLayer,
  noteSnapshot,
  unindexedChanges,
  unindexedSnapshot,
} from "../../../src/application/notes";
import { EventBus, EventBusLive } from "../../../src/application/shell/event-bus";
import { SettingsServiceLive } from "../../../src/application/shell/settings-service";
import { noteStoreLayer } from "../../../src/infrastructure/obsidian/notes";
import { hostEventsLayer } from "../../../src/infrastructure/obsidian/shell/events";
import {
  inMemoryStore,
  recordingLogger,
  recordingNotifier,
  sequentialIncidents,
  testMessages,
} from "../../support/layers";
import {
  REFERENCE_TYPES,
  referenceCommunity,
  referenceItem,
} from "../../support/notes/reference-types";

/** What a spec reads of the probe's note index: counts only, plain data. */
export type IndexCounts = {
  readonly ready: boolean;
  readonly failed: boolean;
  readonly communities: number;
  readonly items: number;
  readonly unindexed: number;
};

/**
 * The plugin's real host event adapter (`hostEventsLayer`) and the note index on a runtime of its
 * own, built in the probe's `onload` as the plugin composes them: the index over the real Obsidian
 * `NoteStore`, for the reference vault's two types (`community`, `item`), built before the host
 * event adapter. A spec sees what the adapter publishes and how fast the index follows, without a
 * hook in the plugin. `seen` runs inside each publish, `indexReady` once the first build is
 * published. Settings, defects and logs stay in memory, never on the screen.
 */
export const hostEventsProbe = (
  plugin: Plugin,
  seen: (event: AppEvent) => void,
  indexReady: () => void,
) => {
  const bus = Layer.effect(
    EventBus,
    EventBus.useSync((live) =>
      EventBus.of({
        ...live,
        publish: (event) =>
          Effect.suspend(() => {
            seen(event);
            return live.publish(event);
          }),
      }),
    ),
  ).pipe(Layer.provideMerge(EventBusLive));
  const notifier = recordingNotifier().layer;
  const support = Layer.mergeAll(
    bus,
    recordingLogger().layer,
    notifier,
    sequentialIncidents(),
    testMessages,
    SettingsServiceLive.pipe(
      Layer.provide(Layer.mergeAll(inMemoryStore().layer, notifier, testMessages)),
    ),
  );
  const index = noteIndexLayer(REFERENCE_TYPES).pipe(
    Layer.provideMerge(Layer.merge(noteStoreLayer(plugin.app), support)),
  );
  const runtime = ManagedRuntime.make(hostEventsLayer(plugin).pipe(Layer.provideMerge(index)));
  runtime.runFork(
    Stream.runHead(Stream.filter(unindexedChanges, (snapshot) => snapshot.ready)).pipe(
      Effect.andThen(Effect.sync(indexReady)),
    ),
  );

  const counts = Effect.gen(function* () {
    const communities = yield* noteSnapshot(referenceCommunity);
    const items = yield* noteSnapshot(referenceItem);
    const unindexed = yield* unindexedSnapshot;
    return {
      ready: unindexed.ready,
      failed: unindexed.failure !== undefined,
      communities: communities.notes.length,
      items: items.notes.length,
      unindexed: unindexed.notes.length,
    } satisfies IndexCounts;
  });

  return {
    counts: (): Promise<IndexCounts> => runtime.runPromise(counts),
    /**
     * Resolves with `performance.now()` at the moment the index publishes an item at `path`
     * titled `title`. Call it before the edit: it subscribes at once.
     */
    titleShown: (path: string, title: string): Promise<number> =>
      runtime.runPromise(
        Stream.runHead(
          Stream.filter(noteChanges(referenceItem), (snapshot) =>
            snapshot.notes.some((note) => note.path === path && note.values.title === title),
          ),
        ).pipe(Effect.map((found) => (Option.isSome(found) ? performance.now() : -1))),
      ),
    dispose: () => runtime.dispose(),
  };
};
