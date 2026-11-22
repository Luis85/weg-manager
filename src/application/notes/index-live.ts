import { Deferred, Effect, Layer, Option, Queue, Result, Stream, SubscriptionRef } from "effect";
import type { NoteFields, NoteType } from "../../domain/notes";
import {
  EventBus,
  Logger,
  SettingsService,
  reportDefect,
  type Incidents,
  type Messages,
  type Notifier,
} from "../shell";
import { NoteIndexReadError } from "./errors";
import { awaitReady, collectBatch, forwardTo, type Command } from "./index-batches";
import { contentsOf, entryOf, sameNotes, unindexedEntry, type Entry } from "./index-state";
import {
  NoteIndex,
  type IndexStatus,
  type IndexedNote,
  type NoteSnapshot,
  type NoteTypeRegistry,
  type UnindexedSnapshot,
} from "./note-index";
import { isInFolder } from "./folders";
import { NoteStore } from "./ports";

const EMPTY = { ready: false, failure: undefined, notes: [] } as const;

const UNREADABLE = { code: "frontmatter.unreadable" } as const;

type Snapshots<A> = SubscriptionRef.SubscriptionRef<IndexStatus & { readonly notes: readonly A[] }>;

/** Sets `ref` to `status` and `notes` unless it holds them already: unchanged publishes nothing. */
const publishTo = <A>(ref: Snapshots<A>, status: IndexStatus, notes: readonly A[]) =>
  Effect.flatMap(SubscriptionRef.get(ref), (current) =>
    current.ready === status.ready &&
    current.failure === status.failure &&
    sameNotes(current.notes, notes)
      ? Effect.void
      : SubscriptionRef.set(ref, { ...status, notes }),
  );

/** Tells each caller of a rebuild that it is done. */
const completeAll = (rebuilds: readonly Deferred.Deferred<void>[]) =>
  Effect.asVoid(Effect.forEach(rebuilds, (done) => Deferred.succeed(done, undefined)));

const unregistered = (type: { readonly type: string }) =>
  new Error(`The note type ${type.type} is not registered.`);

/**
 * The note index (ADR 0007) for the types of `registry`: built at `VaultReady` from one
 * `NoteStore.list`, then following the vault's file events in batches (`index-batches.ts`) as
 * idempotent re-reads by path, rebuilt on demand and when the root folder changes. It runs in the
 * scope of the runtime and stops with it. A failed read keeps the last notes and sets `failure`;
 * a defect is reported once and the index goes on.
 */
export const noteIndexLayer = (registry: NoteTypeRegistry) =>
  Layer.effect(
    NoteIndex,
    Effect.gen(function* () {
      const types = new Map(registry.map((type) => [type.type, type]));
      if (types.size !== registry.length) {
        return yield* Effect.die(new Error("A note type is registered twice."));
      }
      const store = yield* NoteStore;
      const settings = yield* SettingsService;
      const logger = yield* Logger;
      const reporting = yield* Effect.context<Incidents | Logger | Messages | Notifier>();
      const refs = new Map<string, Snapshots<IndexedNote<NoteFields>>>();
      for (const name of types.keys()) {
        refs.set(name, yield* SubscriptionRef.make<NoteSnapshot<NoteFields>>(EMPTY));
      }
      const unindexedRef = yield* SubscriptionRef.make<UnindexedSnapshot>(EMPTY);
      const queue = yield* Effect.acquireRelease(Queue.unbounded<Command>(), Queue.shutdown);
      let entries = new Map<string, Entry>();
      let status: IndexStatus = { ready: false, failure: undefined };

      const failed = () => {
        status = { ready: status.ready, failure: status.failure ?? new NoteIndexReadError() };
      };

      const publish = Effect.gen(function* () {
        const contents = contentsOf(types, entries.values());
        for (const [name, ref] of refs) {
          yield* publishTo(ref, status, contents.records.get(name) ?? []);
        }
        // Last, so a test that waits for it knows every type's snapshot is set.
        yield* publishTo(unindexedRef, status, contents.unindexed);
      });

      const build = Effect.gen(function* () {
        const { rootFolder } = yield* settings.current;
        const read = yield* Effect.result(Effect.all([store.list, store.unreadable(rootFolder)]));
        if (Result.isFailure(read)) {
          failed();
          yield* logger.log({ level: "warn", event: "notes.index.build.failed" });
          return yield* publish;
        }
        const [listed, broken] = read.success;
        const next = new Map<string, Entry>();
        for (const note of listed) {
          const entry = entryOf(types, note, entries.get(note.path));
          if (entry !== undefined) next.set(note.path, entry);
        }
        for (const path of broken) next.set(path, unindexedEntry(path, UNREADABLE));
        entries = next;
        status = { ready: true, failure: undefined };
        yield* publish;
        const records = [...next.values()].filter((entry) => entry.kind === "record").length;
        const data = { records, unindexed: next.size - records };
        yield* logger.log({ level: "info", event: "notes.index.built", data });
      });

      /**
       * Reads one path again and replaces its entry, or removes it when the note is gone or no
       * record. Says whether the read failed, and whether the note may be an unreadable one.
       */
      const reread = (path: string, rootFolder: string) =>
        Effect.map(Effect.result(store.read(path)), (read) => {
          if (Result.isFailure(read)) {
            const gone = read.failure._tag === "NoteNotFoundError";
            if (gone) entries.delete(path);
            return { failed: !gone, candidate: false };
          }
          const entry = entryOf(types, read.success, entries.get(path));
          if (entry === undefined) entries.delete(path);
          else entries.set(path, entry);
          return { failed: false, candidate: entry === undefined && isInFolder(path, rootFolder) };
        });

      /** Marks the candidates that `unreadable` lists; how many could not be checked. */
      const lookUpUnreadable = (candidates: readonly string[], rootFolder: string) =>
        Effect.map(Effect.result(store.unreadable(rootFolder)), (broken) => {
          if (Result.isFailure(broken)) return candidates.length;
          const unreadable = new Set(broken.success);
          for (const path of candidates.filter((candidate) => unreadable.has(candidate))) {
            entries.set(path, unindexedEntry(path, UNREADABLE));
          }
          return 0;
        });

      const follow = (paths: ReadonlySet<string>) =>
        Effect.gen(function* () {
          const { rootFolder } = yield* settings.current;
          let failures = 0;
          const candidates: string[] = [];
          for (const path of paths) {
            const outcome = yield* reread(path, rootFolder);
            if (outcome.failed) failures += 1;
            if (outcome.candidate) candidates.push(path);
          }
          if (candidates.length > 0) failures += yield* lookUpUnreadable(candidates, rootFolder);
          if (failures > 0) {
            failed();
            const data = { notes: failures };
            yield* logger.log({ level: "warn", event: "notes.index.read.failed", data });
          }
          yield* publish;
        });

      /** A defect in a build or a batch is reported once; the index keeps running. */
      const guarded = (effect: Effect.Effect<void>) =>
        Effect.catchDefect(effect, (defect) =>
          Effect.asVoid(Effect.provide(reportDefect(defect), reporting)),
        );

      /** Interrupted when the index stops, so a rebuild that still waits ends with it. */
      const stopped = yield* Deferred.make<void>();
      yield* Effect.addFinalizer(() => Deferred.interrupt(stopped));
      const buildFor = (rebuilds: readonly Deferred.Deferred<void>[]) =>
        guarded(build).pipe(Effect.ensuring(completeAll(rebuilds)));

      /** Asks the worker for a rebuild; `none` once the index has stopped. */
      const requestRebuild = Effect.gen(function* () {
        const done = yield* Deferred.make<void>();
        const asked = yield* Queue.offer(queue, { _tag: "rebuild", done });
        return asked ? Option.some(done) : Option.none();
      });

      const step = Effect.flatMap(collectBatch(queue), ({ paths, rebuilds }) =>
        rebuilds.length === 0 ? guarded(follow(paths)) : buildFor(rebuilds),
      );
      const worker = Effect.flatMap(awaitReady(queue), (early) =>
        Effect.andThen(buildFor(early), Effect.forever(step)),
      );

      const events = yield* (yield* EventBus).subscribe;
      yield* Effect.forkScoped(Stream.runForEach(events, forwardTo(queue)));
      const rootChanges = settings.changes.pipe(
        Stream.map(({ rootFolder }) => rootFolder),
        Stream.changes,
        Stream.drop(1),
      );
      yield* Effect.forkScoped(Stream.runForEach(rootChanges, () => requestRebuild));
      yield* Effect.forkScoped(worker);

      const refOf = <F extends NoteFields>(type: NoteType<F>) =>
        Option.map(
          Option.fromNullishOr(refs.get(type.type)),
          (ref) => ref as unknown as SubscriptionRef.SubscriptionRef<NoteSnapshot<F>>,
        );

      return NoteIndex.of({
        snapshot: (type) =>
          Option.match(refOf(type), {
            onNone: () => Effect.die(unregistered(type)),
            onSome: SubscriptionRef.get,
          }),
        changes: (type) =>
          Option.match(refOf(type), {
            onNone: () => Stream.die(unregistered(type)),
            onSome: SubscriptionRef.changes,
          }),
        unindexed: SubscriptionRef.get(unindexedRef),
        unindexedChanges: SubscriptionRef.changes(unindexedRef),
        rebuild: Effect.flatMap(requestRebuild, (asked) =>
          Option.match(asked, {
            onNone: () => Effect.void,
            onSome: (done) => Effect.raceFirst(Deferred.await(done), Deferred.await(stopped)),
          }),
        ),
      });
    }),
  );
