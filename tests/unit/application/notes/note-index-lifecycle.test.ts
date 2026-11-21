import { assert, describe, it } from "@effect/vitest";
import { Duration, Effect, Exit, Fiber, Layer, Scope } from "effect";
import { TestClock } from "effect/testing";
import { AppEvent } from "../../../../src/application/events";
import {
  INDEX_BATCH_QUIET,
  NoteIndexReadError,
  rebuildNoteIndex,
} from "../../../../src/application/notes";
import { SettingsService } from "../../../../src/application/shell";
import {
  built,
  decoded,
  indexFixture,
  item,
  paths,
  publish,
  recordSnapshots,
  settle,
  snapshotOf,
  throwingType,
  unindexed,
  until,
  untilUnindexed,
  vaultReady,
} from "../../../support/notes/index-fixture";
import { testItem } from "../../../support/notes/test-note-type";

const quiet = Duration.toMillis(INDEX_BATCH_QUIET);

describe("the note index when reads fail", () => {
  it.effect("shows the failure without notes when the first build cannot list", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    fixture.memory.setFailReads(true);
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* untilUnindexed((next) => next.failure !== undefined);
      assert.deepStrictEqual(yield* snapshotOf(testItem), {
        ready: false,
        failure: new NoteIndexReadError(),
        notes: [],
      });
      yield* settle;
      assert.deepStrictEqual(fixture.logger.entries(), [
        { level: "warn", event: "notes.index.build.failed" },
      ]);
      fixture.memory.setFailReads(false);
      yield* rebuildNoteIndex;
      assert.deepStrictEqual(yield* snapshotOf(testItem), {
        ready: true,
        failure: undefined,
        notes: [decoded("A.md", item(1))],
      });
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("keeps the notes it has when a rebuild cannot list", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    return Effect.gen(function* () {
      yield* vaultReady;
      const before = yield* built;
      fixture.memory.setFailReads(true);
      yield* rebuildNoteIndex;
      const after = yield* snapshotOf(testItem);
      assert.deepStrictEqual(after, { ...before, failure: new NoteIndexReadError() });
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("keeps a note's last state when it cannot be read, until a rebuild succeeds", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    fixture.memory.seed("B.md", item(2));
    return Effect.gen(function* () {
      yield* vaultReady;
      const before = yield* built;
      fixture.memory.seed("A.md", item(1, { title: "Neu" }));
      fixture.memory.setFailReads(true);
      yield* TestClock.adjust(quiet);
      const stale = yield* until(testItem, (next) => next.failure !== undefined);
      assert.deepStrictEqual(stale, { ...before, failure: new NoteIndexReadError() });
      assert.deepStrictEqual(fixture.logger.entries().at(-1), {
        level: "warn",
        event: "notes.index.read.failed",
        data: { notes: 1 },
      });
      fixture.memory.setFailReads(false);
      fixture.memory.seed("B.md", item(2, { title: "Auch neu" }));
      yield* TestClock.adjust(quiet);
      const followed = yield* until(testItem, (next) => next.notes[1]?.values.title === "Auch neu");
      assert.deepStrictEqual(followed.failure, new NoteIndexReadError());
      assert.strictEqual(followed.notes[0]?.values.title, "Item 1");
      yield* rebuildNoteIndex;
      const rebuilt = yield* snapshotOf(testItem);
      assert.isUndefined(rebuilt.failure);
      assert.deepStrictEqual(
        rebuilt.notes.map((note) => note.values.title),
        ["Neu", "Auch neu"],
      );
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("fails the build when the unreadable notes cannot be listed", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    fixture.setFailUnreadable(true);
    return Effect.gen(function* () {
      yield* vaultReady;
      const failed = yield* until(testItem, (next) => next.failure !== undefined);
      assert.deepStrictEqual([failed.ready, failed.notes], [false, []]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("shows the failure when the unreadable notes cannot be listed after a change", () => {
    const fixture = indexFixture();
    fixture.memory.seed("WEG Manager/A.md", item(1));
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* built;
      fixture.setFailUnreadable(true);
      fixture.memory.seed("WEG Manager/A.md", "broken");
      yield* TestClock.adjust(quiet);
      const failed = yield* until(testItem, (next) => next.failure !== undefined);
      assert.deepStrictEqual(failed.notes, []);
      assert.deepStrictEqual((yield* unindexed).notes, []);
      assert.deepStrictEqual(fixture.logger.entries().at(-1), {
        level: "warn",
        event: "notes.index.read.failed",
        data: { notes: 1 },
      });
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("removes a note that is gone by the time it is read, without a failure", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* built;
      yield* publish(AppEvent.MetadataChanged({ path: "A.md", extension: "md" }));
      yield* publish(AppEvent.MetadataChanged({ path: "Weg.md", extension: "md" }));
      yield* TestClock.adjust(quiet);
      yield* settle;
      assert.deepStrictEqual(yield* snapshotOf(testItem), {
        ready: true,
        failure: undefined,
        notes: [decoded("A.md", item(1))],
      });
      assert.strictEqual(fixture.reads(), 2);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("reports a defect once and goes on following", () => {
    const fixture = indexFixture({ types: [throwingType] });
    fixture.memory.seed("A.md", item(1, { title: "Bug" }));
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* settle;
      assert.strictEqual(fixture.notifier.messages().length, 1);
      assert.deepStrictEqual(
        fixture.logger.entries().map((entry) => entry.event),
        ["defect.reported"],
      );
      assert.isFalse((yield* snapshotOf(testItem)).ready);
      fixture.memory.seed("A.md", item(1));
      yield* rebuildNoteIndex;
      assert.deepStrictEqual(paths(yield* snapshotOf(testItem)), ["A.md"]);
      assert.strictEqual(fixture.notifier.messages().length, 1);
    }).pipe(Effect.provide(fixture.layer));
  });
});

describe("rebuilding the note index", () => {
  it.effect("reads every note again, also one whose event never came", () => {
    const fixture = indexFixture();
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* built;
      const seen = yield* recordSnapshots(testItem);
      fixture.memory.seed("A.md", item(1));
      yield* rebuildNoteIndex;
      assert.deepStrictEqual(paths(yield* snapshotOf(testItem)), ["A.md"]);
      // The rebuild took the pending change along; the batch publishes nothing more.
      yield* TestClock.adjust(quiet);
      assert.strictEqual(seen.length, 2);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("waits for VaultReady when asked before it", () => {
    const fixture = indexFixture();
    fixture.memory.seed("A.md", item(1));
    return Effect.gen(function* () {
      const rebuild = yield* Effect.forkChild(rebuildNoteIndex);
      yield* TestClock.adjust(quiet);
      assert.isUndefined(rebuild.pollUnsafe());
      yield* vaultReady;
      yield* Fiber.join(rebuild);
      assert.deepStrictEqual(paths(yield* snapshotOf(testItem)), ["A.md"]);
    }).pipe(Effect.provide(fixture.layer));
  });

  it.effect("rebuilds when the root folder changes, and not for other settings", () => {
    const fixture = indexFixture();
    fixture.memory.seed("WEG Manager/A.md", "broken");
    fixture.memory.seed("Beirat/B.md", "broken");
    return Effect.gen(function* () {
      yield* vaultReady;
      yield* built;
      const settings = yield* SettingsService;
      const reads = fixture.reads();
      yield* settings.update({ greeting: "Moin" });
      yield* settle;
      assert.deepStrictEqual(paths(yield* unindexed), ["WEG Manager/A.md"]);
      assert.deepStrictEqual(fixture.logger.entries().length, 1);
      yield* settings.update({ rootFolder: "Beirat" });
      const moved = yield* untilUnindexed((next) => next.notes[0]?.path === "Beirat/B.md");
      assert.deepStrictEqual(paths(moved), ["Beirat/B.md"]);
      assert.strictEqual(fixture.reads(), reads);
    }).pipe(Effect.provide(fixture.layer));
  });
});

/** The fixture's index in a scope of its own, which the test closes as a plugin unload does. */
const inScope = Effect.gen(function* () {
  const fixture = indexFixture();
  const scope = yield* Scope.make();
  const context = yield* Layer.buildWithScope(fixture.layer, scope);
  const run = <A, E>(effect: Effect.Effect<A, E, Layer.Success<typeof fixture.layer>>) =>
    Effect.provide(effect, context);
  return { fixture, scope, run };
});

describe("the note index's lifecycle", () => {
  it.effect("stops with its scope: nothing is read or published after", () =>
    Effect.gen(function* () {
      const { fixture, scope, run } = yield* inScope;
      yield* run(vaultReady);
      yield* run(built);
      const seen = yield* run(recordSnapshots(testItem));
      fixture.memory.seed("A.md", item(1));
      yield* Scope.close(scope, Exit.void);
      yield* TestClock.adjust(quiet);
      yield* settle;
      assert.strictEqual(fixture.reads(), 0);
      assert.strictEqual(seen.length, 1);
      yield* run(rebuildNoteIndex);
      assert.deepStrictEqual(paths(yield* run(snapshotOf(testItem))), []);
    }),
  );

  it.effect("ends a rebuild that still waits for VaultReady when its scope closes", () =>
    Effect.gen(function* () {
      const { scope, run } = yield* inScope;
      const pending = yield* Effect.forkChild(run(rebuildNoteIndex));
      yield* settle;
      yield* Scope.close(scope, Exit.void);
      assert.isTrue(Exit.hasInterrupts(yield* Fiber.await(pending)));
    }),
  );
});
