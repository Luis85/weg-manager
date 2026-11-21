import { Context, Effect, Exit, Fiber, Layer, Scope, Stream } from "effect";
import { describe, expect, it } from "vitest";
import { EventBus, EventBusLive } from "../../../../src/application/shell/event-bus";
import { AppEvent } from "../../../../src/application/events";
import { isMarkdown } from "../../../../src/application/shell/events";

const created = (path: string) => AppEvent.FileCreated({ path, extension: "md" });
const ready = AppEvent.LayoutReady();

const run = <A, E>(effect: Effect.Effect<A, E, EventBus | Scope.Scope>) =>
  Effect.runPromise(Effect.scoped(effect.pipe(Effect.provide(EventBusLive))));

/** Starts collecting `count` items from a stream that has subscribed before this returns. */
const collect = <A>(stream: Effect.Effect<Stream.Stream<A>, never, Scope.Scope>, count: number) =>
  Effect.gen(function* () {
    const subscribed = yield* stream;
    return yield* subscribed.pipe(Stream.take(count), Stream.runCollect, Effect.forkScoped);
  });

describe("EventBus", () => {
  it("delivers every event to every subscriber in publish order", async () => {
    const result = await run(
      Effect.gen(function* () {
        const bus = yield* EventBus;
        const first = yield* collect(bus.subscribe, 3);
        const second = yield* collect(bus.subscribe, 3);
        yield* bus.publish(ready);
        yield* bus.publish(created("a.md"));
        yield* bus.publish(created("b.md"));
        return [yield* Fiber.join(first), yield* Fiber.join(second)];
      }),
    );
    const expected = [ready, created("a.md"), created("b.md")];
    expect(result).toEqual([expected, expected]);
  });

  it("narrows on(tag) to one member", async () => {
    const paths = await run(
      Effect.gen(function* () {
        const bus = yield* EventBus;
        const fiber = yield* bus.on("FileRenamed").pipe(
          Stream.map((event) => `${event.oldPath}->${event.path}`),
          Stream.take(1),
          Stream.runCollect,
          Effect.forkScoped,
        );
        yield* Effect.yieldNow;
        yield* bus.publish(created("a.md"));
        yield* bus.publish(
          AppEvent.FileRenamed({ path: "b.md", oldPath: "a.md", extension: "md" }),
        );
        return yield* Fiber.join(fiber);
      }),
    );
    expect(paths).toEqual(["a.md->b.md"]);
  });

  it("gives the whole stream through events", async () => {
    const seen = await run(
      Effect.gen(function* () {
        const bus = yield* EventBus;
        const fiber = yield* bus.events.pipe(Stream.take(1), Stream.runCollect, Effect.forkScoped);
        yield* Effect.yieldNow;
        yield* bus.publish(ready);
        return yield* Fiber.join(fiber);
      }),
    );
    expect(seen).toEqual([ready]);
  });

  it("shows a late subscriber only the events published after it subscribed", async () => {
    const seen = await run(
      Effect.gen(function* () {
        const bus = yield* EventBus;
        yield* bus.publish(created("early.md"));
        const late = yield* collect(bus.subscribe, 1);
        yield* bus.publish(created("late.md"));
        return yield* Fiber.join(late);
      }),
    );
    expect(seen).toEqual([created("late.md")]);
  });

  it("keeps delivering to the others when one subscriber fails or dies", async () => {
    const result = await run(
      Effect.gen(function* () {
        const bus = yield* EventBus;
        const failing = yield* bus.subscribe.pipe(
          Effect.flatMap((stream) =>
            stream.pipe(
              Stream.runForEach(() => Effect.fail("subscriber failed")),
              Effect.forkScoped,
            ),
          ),
        );
        const dying = yield* bus.subscribe.pipe(
          Effect.flatMap((stream) =>
            stream.pipe(
              Stream.runForEach(() => Effect.die(new Error("subscriber bug"))),
              Effect.forkScoped,
            ),
          ),
        );
        const healthy = yield* collect(bus.subscribe, 2);
        yield* bus.publish(created("a.md"));
        const failed = yield* Fiber.await(failing);
        const died = yield* Fiber.await(dying);
        yield* bus.publish(created("b.md"));
        return {
          failed: Exit.isFailure(failed),
          died: Exit.isFailure(died),
          healthy: yield* Fiber.join(healthy),
        };
      }),
    );
    expect(result).toEqual({
      failed: true,
      died: true,
      healthy: [created("a.md"), created("b.md")],
    });
  });

  it("never drops events during a bulk sync of thousands of files", async () => {
    const count = 5000;
    const seen = await run(
      Effect.gen(function* () {
        const bus = yield* EventBus;
        const fiber = yield* collect(bus.subscribe, count);
        for (let index = 0; index < count; index += 1) yield* bus.publish(created(`${index}.md`));
        return (yield* Fiber.join(fiber)).length;
      }),
    );
    expect(seen).toBe(count);
  });

  it("ends every running stream when its scope closes", async () => {
    const ended = await Effect.runPromise(
      Effect.gen(function* () {
        const scope = yield* Scope.make();
        const bus = Context.get(yield* Layer.buildWithScope(EventBusLive, scope), EventBus);
        // Detached: only the bus shutting down can end this stream.
        const fiber = yield* bus.events.pipe(Stream.runCollect, Effect.forkDetach);
        yield* Effect.yieldNow;
        yield* bus.publish(ready);
        yield* Scope.close(scope, Exit.void);
        yield* bus.publish(created("after.md"));
        return yield* Fiber.await(fiber).pipe(Effect.timeout("1 second"));
      }),
    );
    // Without a shutdown the stream never ends and the timeout rejects the test.
    const delivered = Exit.isSuccess(ended) ? ended.value : [];
    expect(delivered).not.toContainEqual(created("after.md"));
  });
});

describe("AppEvent", () => {
  it("is plain serialisable data, switchable on _tag", () => {
    const event: AppEvent = AppEvent.FileRenamed({
      path: "b.md",
      oldPath: "a.md",
      extension: "md",
    });
    expect(JSON.parse(JSON.stringify(event))).toEqual({
      _tag: "FileRenamed",
      path: "b.md",
      oldPath: "a.md",
      extension: "md",
    });
    expect(AppEvent.$is("FileRenamed")(event)).toBe(true);
  });

  it("tells Markdown file events apart cheaply", () => {
    expect(isMarkdown(created("a.md"))).toBe(true);
    expect(isMarkdown(AppEvent.FileModified({ path: "a.png", extension: "png" }))).toBe(false);
    expect(isMarkdown(AppEvent.MetadataChanged({ path: "a.md", extension: "md" }))).toBe(true);
    expect(isMarkdown(AppEvent.ActiveFileChanged({ path: "a.md" }))).toBe(false);
    expect(isMarkdown(ready)).toBe(false);
  });
});
