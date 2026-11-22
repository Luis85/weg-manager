import { Duration, Effect, Layer } from "effect";
import { TestClock } from "effect/testing";
import { communitySelectionLayer } from "../../../src/application/communities";
import { NoteStore } from "../../../src/application/notes";
import { INDEX_BATCH_QUIET } from "../../../src/application/notes/index-batches";
import { DeviceStore, type DeviceValue } from "../../../src/application/shell";
import { communityType } from "../../../src/domain/communities";
import { sequentialIdGenerator } from "../../../src/infrastructure/memory/notes";
import { deviceStoreInMemory } from "../../../src/infrastructure/memory/shell";
import { indexFixture, settle, untilUnindexed, vaultReady } from "../notes/index-fixture";

/** The id of the `n`-th community `sequentialIdGenerator` makes. */
export const communityId = (n: number) =>
  `community-00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`;

export const FOLDER = "WEG Manager/Gemeinschaften";

/** A valid community note's frontmatter; `extra` overrides any key. */
export const communityNote = (n: number, extra: Record<string, unknown> = {}) => ({
  schema: "weg-manager.community/v1",
  id: communityId(n),
  name: `Gemeinschaft ${n}`,
  short_code: `G${n}`,
  color: "teal",
  kind: "WEG",
  unit_label: "Einheiten",
  ...extra,
});

export type CommunitiesFixtureOptions = {
  /** The settings file, e.g. `{ rootFolder: "Beirat" }`. */
  readonly settings?: unknown;
  /** What the device store holds at start. */
  readonly device?: Readonly<Record<string, DeviceValue>>;
};

/**
 * The communities module over the note index, the in-memory `NoteStore`, a sequential id generator
 * and an in-memory device store; the index holds the community type alone. Its effects run under
 * `TestClock`: `indexed` moves the clock until the index has read every write.
 */
export const communitiesFixture = (options: CommunitiesFixtureOptions = {}) => {
  const index = indexFixture({ types: [communityType], settings: options.settings });
  const ids = sequentialIdGenerator();
  let deviceWrites = 0;
  const device = Layer.effect(
    DeviceStore,
    DeviceStore.useSync((store) =>
      DeviceStore.of({
        ...store,
        write: (key, value) =>
          Effect.suspend(() => {
            deviceWrites += 1;
            return store.write(key, value);
          }),
      }),
    ),
  ).pipe(Layer.provide(deviceStoreInMemory(options.device)));
  const services = Layer.mergeAll(index.layer, ids.layer, device);
  const layer = communitySelectionLayer.pipe(Layer.provideMerge(services));
  /** How often the device store was written. */
  return { ...index, layer, deviceWrites: () => deviceWrites };
};

/** Builds the index: `VaultReady`, then the first build. */
export const ready = Effect.andThen(
  vaultReady,
  untilUnindexed((snapshot) => snapshot.ready),
);

/** Lets the index read what was written or seeded since: one quiet batch. */
export const indexed = Effect.andThen(
  TestClock.adjust(Duration.toMillis(INDEX_BATCH_QUIET)),
  settle,
);

/** The note at `path` as the store holds it now. */
export const stored = (path: string) => NoteStore.use((store) => store.read(path));
