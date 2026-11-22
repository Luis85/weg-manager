import { Effect, Layer, Option, Stream } from "effect";
import { AppEvent } from "../../../src/application/events";
import {
  NoteIndex,
  NoteStore,
  noteIndexLayer,
  type IndexStatus,
  type IndexedNote,
  type IndexedType,
  type NoteSnapshot,
  type NoteTypeRegistry,
  type UnindexedSnapshot,
} from "../../../src/application/notes";
import { EventBus, SettingsServiceLive, VaultReadError } from "../../../src/application/shell";
import {
  defineNoteType,
  required,
  text,
  type NoteFields,
  type NoteType,
} from "../../../src/domain/notes";
import { memoryNoteStore } from "../../../src/infrastructure/memory/notes";
import {
  inMemoryStore,
  recordingEventBus,
  recordingLogger,
  recordingNotifier,
  sequentialIncidents,
  testMessages,
} from "../layers";
import { FULL, testItem } from "./test-note-type";

/** A second test-only type, so a note can change its type. */
export const testOther = defineNoteType({
  type: "test-other",
  version: 1,
  fields: { title: required(text()) },
  migrations: {},
});

export const TYPES: NoteTypeRegistry = [testItem, testOther];

/** The id of the `n`-th test item. */
export const itemId = (n: number) =>
  `test-item-00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;

/** A valid test item with its own id; `extra` overrides any key. */
export const item = (n: number, extra: Record<string, unknown> = {}) => ({
  ...FULL,
  id: itemId(n),
  title: `Item ${n}`,
  ...extra,
});

export type IndexFixtureOptions = {
  readonly types?: NoteTypeRegistry;
  /** The settings file as `data.json` holds it, e.g. `{ rootFolder: "Beirat" }`. */
  readonly settings?: unknown;
};

/**
 * The note index over the in-memory `NoteStore`, on a recording event bus, with in-memory
 * settings, logger and notifier. `reads()` counts `NoteStore.read` calls, so a test can tell
 * whether the index read anything at all.
 */
export const indexFixture = (options: IndexFixtureOptions = {}) => {
  const memory = memoryNoteStore();
  const bus = recordingEventBus();
  const logger = recordingLogger();
  const notifier = recordingNotifier();
  const settingsStore = inMemoryStore({ initial: options.settings });
  let reads = 0;
  let scans = 0;
  let failUnreadable = false;
  const counted = Layer.effect(
    NoteStore,
    NoteStore.useSync((store) =>
      NoteStore.of({
        ...store,
        read: (path) =>
          Effect.suspend(() => {
            reads += 1;
            return store.read(path);
          }),
        unreadable: (folder) =>
          Effect.suspend(() => {
            scans += 1;
            return failUnreadable
              ? Effect.fail(new VaultReadError({ cause: new Error("unreadable failed") }))
              : store.unreadable(folder);
          }),
      }),
    ),
  ).pipe(Layer.provide(memory.layer.pipe(Layer.provide(bus.layer))));
  const settings = SettingsServiceLive.pipe(
    Layer.provide(Layer.mergeAll(settingsStore.layer, notifier.layer, testMessages)),
  );
  const services = Layer.mergeAll(
    counted,
    settings,
    logger.layer,
    notifier.layer,
    sequentialIncidents(),
    testMessages,
    bus.layer,
  );
  const layer = noteIndexLayer(options.types ?? TYPES).pipe(Layer.provideMerge(services));
  return {
    layer,
    memory,
    bus,
    logger,
    notifier,
    reads: () => reads,
    /** How often `unreadable` was called: once per build, and per batch with a candidate. */
    scans: () => scans,
    /** Makes `unreadable` alone fail, while `list` and `read` still work. */
    setFailUnreadable: (fail: boolean) => {
      failUnreadable = fail;
    },
  };
};

/** What the host event adapter publishes once the metadata cache holds every note. */
export const vaultReady = EventBus.use((bus) =>
  Effect.andThen(bus.publish(AppEvent.LayoutReady()), bus.publish(AppEvent.VaultReady())),
);

export const publish = (event: AppEvent) => EventBus.use((bus) => bus.publish(event));

/** Lets every forked fiber run until it waits, for checks where nothing is awaited. */
export const settle = Effect.forEach(Array.from({ length: 20 }), () => Effect.yieldNow, {
  discard: true,
});

export const snapshotOf = <F extends NoteFields>(type: NoteType<F>) =>
  NoteIndex.use((index) => index.snapshot(type));

export const unindexed = NoteIndex.use((index) => index.unindexed);

/** Waits for the first snapshot of `type` that `holds`: the current one or a later one. */
export const until = <F extends NoteFields>(
  type: NoteType<F>,
  holds: (snapshot: NoteSnapshot<F>) => boolean,
) =>
  NoteIndex.use((index) =>
    Effect.map(Stream.runHead(Stream.filter(index.changes(type), holds)), Option.getOrThrow),
  );

/** Waits for the first unindexed snapshot that `holds`. */
export const untilUnindexed = (holds: (snapshot: UnindexedSnapshot) => boolean) =>
  NoteIndex.use((index) =>
    Effect.map(Stream.runHead(Stream.filter(index.unindexedChanges, holds)), Option.getOrThrow),
  );

/**
 * Waits until the first build is published, and returns the test type's snapshot. The index sets
 * the unindexed snapshot last, so every type's snapshot is set by then.
 */
export const built = Effect.andThen(
  untilUnindexed((snapshot) => snapshot.ready),
  NoteIndex.use((index) => index.snapshot(testItem)),
);

/** Each snapshot of `type` the index publishes from now on, the current one first. */
export const recordSnapshots = <F extends NoteFields>(type: NoteType<F>) =>
  Effect.gen(function* () {
    const seen: NoteSnapshot<F>[] = [];
    const index = yield* NoteIndex;
    yield* Effect.forkChild(
      Stream.runForEach(index.changes(type), (snapshot) =>
        Effect.sync(() => {
          seen.push(snapshot);
        }),
      ),
    );
    yield* Effect.yieldNow;
    return seen;
  });

/** The test type, counting its decodes: an unchanged note is not decoded again. */
export const countingType = () => {
  let decodes = 0;
  const type: IndexedType = {
    type: testItem.type,
    fields: testItem.fields,
    decode: (note) => {
      decodes += 1;
      return testItem.decode(note);
    },
  };
  return { type, decodes: () => decodes };
};

/** A test-only type whose decode throws for a note titled `Bug`: a defect in the index. */
export const throwingType: IndexedType = {
  type: testItem.type,
  fields: testItem.fields,
  decode: (note) => {
    if (note.frontmatter["title"] === "Bug") throw new Error("decode bug");
    return testItem.decode(note);
  },
};

/** A test item as the index holds it, decoded by the test type itself. */
export const decoded = (path: string, frontmatter: Record<string, unknown>) =>
  testItem.decode({ path, frontmatter }) as IndexedNote<typeof testItem.fields>;

/** A snapshot as the index publishes it: the status, the notes, and their lookup by id. */
export const expectedSnapshot = <F extends NoteFields>(
  status: IndexStatus,
  notes: readonly IndexedNote<F>[] = [],
): NoteSnapshot<F> => ({
  ...status,
  notes,
  byId: new Map(notes.flatMap((note) => (note.id === undefined ? [] : [[note.id, note] as const]))),
});

export const paths = (snapshot: { readonly notes: readonly { readonly path: string }[] }) =>
  snapshot.notes.map((note) => note.path);
