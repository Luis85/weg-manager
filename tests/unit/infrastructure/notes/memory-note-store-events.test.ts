import { Effect, Layer, ManagedRuntime } from "effect";
import { describe, expect, it } from "vitest";
import { NoteStore } from "../../../../src/application/notes";
import { memoryNoteStore } from "../../../../src/infrastructure/memory/notes";
import { COMMUNITY } from "../../../support/notes/fixture";
import { STORE_EVENT_STEPS } from "../../../support/notes/store-events";
import { recordingEventBus } from "../../../support/layers";

const withBus = () => {
  const memory = memoryNoteStore();
  const bus = recordingEventBus();
  const runtime = ManagedRuntime.make(memory.layer.pipe(Layer.provideMerge(bus.layer)));
  return { memory, bus, runtime };
};

describe("the in-memory NoteStore on an event bus", () => {
  it("publishes the events of the host event adapter, step by step", async () => {
    const { memory, bus, runtime } = withBus();
    const seed = (path: string, frontmatter: Record<string, unknown>) => {
      memory.seed(path, frontmatter);
      return Promise.resolve();
    };
    const steps = Effect.forEach(STORE_EVENT_STEPS, (step) =>
      Effect.gen(function* () {
        const before = bus.published().length;
        yield* NoteStore.use((store) => Effect.orDie(step.run(store, seed)));
        return [step.name, bus.published().slice(before)];
      }),
    );
    expect(await runtime.runPromise(steps)).toEqual(
      STORE_EVENT_STEPS.map((step) => [step.name, step.events]),
    );
    await runtime.dispose();
  });

  it("publishes nothing for a failed write", async () => {
    const { memory, bus, runtime } = withBus();
    memory.setFailWrites(true);
    const create = NoteStore.use((store) =>
      Effect.flip(store.create({ folder: "F", name: "A", frontmatter: COMMUNITY })),
    );
    expect((await runtime.runPromise(create))._tag).toBe("NoteWriteError");
    expect(bus.published()).toEqual([]);
    await runtime.dispose();
  });

  it("publishes nothing for a seed before it is built, and nothing without a bus", async () => {
    const { memory, bus, runtime } = withBus();
    memory.seed("A.md", COMMUNITY);
    await runtime.runPromise(Effect.void);
    expect(bus.published()).toEqual([]);
    const alone = memoryNoteStore();
    const list = await Effect.runPromise(
      NoteStore.use((store) => store.list).pipe(Effect.provide(alone.layer)),
    );
    alone.seed("B.md", COMMUNITY);
    expect(list).toEqual([]);
    await runtime.dispose();
  });
});
