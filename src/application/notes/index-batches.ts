import { Clock, Deferred, Duration, Effect, Option, Queue } from "effect";
import type { AppEvent } from "../events";

/**
 * How long the vault stays quiet before a batch of file events is read: a burst (Sync, an agent
 * writing many notes) becomes one publish. A note the plugin writes reaches its view after the
 * metadata cache catches up (a few ms) plus this, well within B-NFR-04's 300 ms.
 */
export const INDEX_BATCH_QUIET = Duration.millis(100);

/** The longest a batch waits after its first event, so a long sync still shows progress. */
export const INDEX_BATCH_MAX = Duration.millis(1000);

/** What the index's worker takes from its queue, one at a time. */
export type Command =
  | { readonly _tag: "ready" }
  | { readonly _tag: "path"; readonly path: string }
  | { readonly _tag: "rebuild"; readonly done: Deferred.Deferred<void> };

/** A batch: the paths to read again, or the rebuilds that replace it. */
type Batch = {
  readonly paths: ReadonlySet<string>;
  readonly rebuilds: readonly Deferred.Deferred<void>[];
};

const isMarkdownPath = (path: string): boolean => path.endsWith(".md");

/**
 * The paths a file event asks the index to read again. `FileCreated` and `FileModified` come
 * before the metadata cache holds the new state; `MetadataChanged` follows each, so they ask for
 * nothing. A rename reads both paths: the old one is gone, the new one may be a note.
 */
const pathsToRead = (event: AppEvent): readonly string[] => {
  if (event._tag === "MetadataChanged" || event._tag === "FileDeleted") {
    return event.extension === "md" ? [event.path] : [];
  }
  if (event._tag === "FileRenamed") return [event.path, event.oldPath].filter(isMarkdownPath);
  return [];
};

/** Puts what `event` asks of the index into its queue: `VaultReady`, or paths to read. */
export const forwardTo = (queue: Queue.Enqueue<Command>) => (event: AppEvent) =>
  event._tag === "VaultReady"
    ? Queue.offer(queue, { _tag: "ready" })
    : Effect.forEach(pathsToRead(event), (path) => Queue.offer(queue, { _tag: "path", path }), {
        discard: true,
      });

/**
 * Drops every command until `VaultReady`: the build reads what those events changed. Returns the
 * rebuilds asked for meanwhile, which the first build completes.
 */
export const awaitReady = (queue: Queue.Dequeue<Command>) =>
  Effect.gen(function* () {
    const early: Deferred.Deferred<void>[] = [];
    for (;;) {
      const command = yield* Queue.take(queue);
      if (command._tag === "ready") return early;
      if (command._tag === "rebuild") early.push(command.done);
    }
  });

/**
 * Waits for the next batch: the paths of every command until the vault was quiet for
 * `INDEX_BATCH_QUIET` or `INDEX_BATCH_MAX` has passed since the first one. A rebuild ends the
 * batch at once, because it reads every note anyway.
 */
export const collectBatch = (queue: Queue.Dequeue<Command>) =>
  Effect.gen(function* () {
    const paths = new Set<string>();
    const rebuilds: Deferred.Deferred<void>[] = [];
    /** Adds a command; false once a rebuild ends the batch. */
    const add = (command: Command): boolean => {
      if (command._tag === "rebuild") rebuilds.push(command.done);
      if (command._tag === "path") paths.add(command.path);
      return command._tag !== "rebuild";
    };
    if (!add(yield* Queue.take(queue))) return { paths, rebuilds } satisfies Batch;
    const deadline = (yield* Clock.currentTimeMillis) + Duration.toMillis(INDEX_BATCH_MAX);
    const quiet = Duration.toMillis(INDEX_BATCH_QUIET);
    for (;;) {
      // Past the deadline the wait is zero or less: only what is queued already still joins.
      const left = deadline - (yield* Clock.currentTimeMillis);
      const next = yield* Effect.timeoutOption(Queue.take(queue), Math.min(quiet, left));
      if (Option.isNone(next) || !add(next.value)) break;
    }
    return { paths, rebuilds } satisfies Batch;
  });
