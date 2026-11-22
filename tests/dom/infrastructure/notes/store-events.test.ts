import { Effect, Layer, ManagedRuntime } from "effect";
import { describe, expect, it, vi } from "vitest";
import { NoteStore } from "../../../../src/application/notes";
import {
  recordingEventBus,
  recordingLogger,
  recordingNotifier,
  sequentialIncidents,
  testMessages,
} from "../../../support/layers";
import { STORE_EVENT_STEPS } from "../../../support/notes/store-events";
import { asObsidian, asObsidianPlugin } from "../../../support/obsidian/real";

vi.mock("obsidian", () => import("@test/obsidian"));

const { Plugin, createTestPlugin, stringifyYaml } = await import("@test/obsidian");
const { hostEventsLayer } = await import("../../../../src/infrastructure/obsidian/shell/events");
const { noteStoreLayer } = await import("../../../../src/infrastructure/obsidian/notes");

class Bare extends Plugin {}

const FILE_EVENTS = new Set(["FileCreated", "FileModified", "FileDeleted", "FileRenamed"]);

/**
 * The other half of `tests/unit/infrastructure/notes/memory-note-store-events.test.ts`: the
 * Obsidian adapter on the double, with the plugin's host event adapter, carries the same file
 * events for the same steps as the in-memory store publishes itself.
 */
describe("the Obsidian NoteStore with the host event adapter", () => {
  it("carries the file events the in-memory store publishes, step by step", async () => {
    const { plugin, app } = createTestPlugin(Bare);
    const bus = recordingEventBus();
    const support = Layer.mergeAll(
      bus.layer,
      recordingLogger().layer,
      recordingNotifier().layer,
      sequentialIncidents(),
      testMessages,
    );
    const layer = Layer.mergeAll(
      hostEventsLayer(asObsidianPlugin(plugin)).pipe(Layer.provideMerge(support)),
      noteStoreLayer(asObsidian(app)),
    );
    const runtime = ManagedRuntime.make(layer);
    await runtime.runPromise(Effect.void);
    const seed = async (path: string, frontmatter: Record<string, unknown>) => {
      app.vault.seedFile(path, `---\n${stringifyYaml(frontmatter)}---\n`);
      await Promise.resolve();
    };
    const fileEvents = () =>
      bus
        .published()
        .filter((event) => FILE_EVENTS.has(event._tag) || event._tag === "MetadataChanged");
    const steps = Effect.forEach(STORE_EVENT_STEPS, (step) =>
      Effect.gen(function* () {
        const before = fileEvents().length;
        yield* NoteStore.use((store) => Effect.orDie(step.run(store, seed)));
        yield* Effect.promise(() => app.metadataCache.whenIndexed());
        return [step.name, fileEvents().slice(before)];
      }),
    );
    expect(await runtime.runPromise(steps)).toEqual(
      STORE_EVENT_STEPS.map((step) => [step.name, step.events]),
    );
    await runtime.dispose();
  });
});
