import { Duration, Effect, Layer, ManagedRuntime, Option, Stream } from "effect";
import { TestClock } from "effect/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { AppRuntime, AppServices } from "../../../../src/application/app-services";
import { appNoteTypes } from "../../../../src/application/note-types";
import {
  noteChanges,
  unindexedSnapshot,
  type NoteSnapshot,
} from "../../../../src/application/notes";
import { appServicesLayer } from "../../../../src/application/app-services-layer";
import { FULL, testItem } from "../../../support/notes/test-note-type";
import { asObsidianPlugin } from "../../../support/obsidian/real";

vi.mock("obsidian", () => import("@test/obsidian"));

const { Plugin, createTestPlugin, stringifyYaml } = await import("@test/obsidian");
const { shellAdapters } = await import("../../../../src/infrastructure/obsidian/shell");
const { notesAdapters } = await import("../../../../src/infrastructure/obsidian/notes");
const { VAULT_READY_DEADLINE } =
  await import("../../../../src/infrastructure/obsidian/shell/events");

class Bare extends Plugin {}

type TestSnapshot = NoteSnapshot<typeof testItem.fields>;

const DEADLINE = Duration.toMillis(VAULT_READY_DEADLINE);

const text = (frontmatter: Record<string, unknown>) => `---\n${stringifyYaml(frontmatter)}---\n`;

const item = (n: number) => ({
  ...FULL,
  id: `test-item-00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`,
  title: `Item ${n}`,
});

const runtimes: AppRuntime[] = [];

afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(runtimes.splice(0).map((runtime) => runtime.dispose()));
});

/** The plugin's own composition on the double, under a clock the test moves. */
const start = async (plugin: InstanceType<typeof Bare>) => {
  const layer: Layer.Layer<AppServices> = appServicesLayer(
    { ...shellAdapters(asObsidianPlugin(plugin)), ...notesAdapters(asObsidianPlugin(plugin)) },
    { developmentMode: false, language: "de", noteTypes: [...appNoteTypes, testItem] },
  );
  const runtime: AppRuntime = ManagedRuntime.make(
    layer.pipe(Layer.provideMerge(TestClock.layer())),
  );
  runtimes.push(runtime);
  await runtime.runPromise(Effect.void);
  return runtime;
};

const macrotask = () => new Promise((resolve) => setTimeout(resolve, 0));

/** Moves the clock a second at a time until the first snapshot of the test type that `holds`. */
const until = (runtime: AppRuntime, holds: (snapshot: TestSnapshot) => boolean) =>
  runtime.runPromise(
    Effect.race(
      Effect.map(Stream.runHead(Stream.filter(noteChanges(testItem), holds)), Option.getOrThrow),
      Effect.forever(Effect.andThen(Effect.promise(macrotask), TestClock.adjust(1000))),
    ),
  );

describe("the note index when a file is never indexed", () => {
  it("builds with the other notes after the deadline and takes the file when Obsidian indexes it", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const { plugin, app } = createTestPlugin(Bare);
    app.metadataCache.withholdIndex("WEG Manager/Nie.md");
    app.vault.seedFile("WEG Manager/A.md", text(item(1)));
    app.vault.seedFile("WEG Manager/Nie.md", text(item(2)));
    await app.metadataCache.whenIndexed();
    const runtime = await start(plugin);

    // The layout is ready (a running app), one file has no entry: the index waits.
    await macrotask();
    await runtime.runPromise(TestClock.adjust(DEADLINE - 1));
    const waiting = await runtime.runPromise(
      Effect.map(Stream.runHead(noteChanges(testItem)), Option.getOrThrow),
    );
    expect(waiting.ready).toBe(false);

    const built = await until(runtime, (snapshot) => snapshot.ready);
    expect(built.notes.map((note) => note.path)).toEqual(["WEG Manager/A.md"]);
    const unindexed = await runtime.runPromise(unindexedSnapshot);
    expect(unindexed.ready).toBe(true);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0]?.slice(0, 3)).toEqual([
      "[weg-manager]",
      "vault.ready.fallback",
      { data: { missing: 1 }, error: undefined, incidentId: undefined },
    ]);

    // Obsidian gets to the file later: its `changed` reaches the index, which reads it.
    app.metadataCache.restoreIndex("WEG Manager/Nie.md");
    const complete = await until(runtime, (snapshot) => snapshot.notes.length === 2);
    expect(complete.notes.map((note) => note.path).toSorted()).toEqual([
      "WEG Manager/A.md",
      "WEG Manager/Nie.md",
    ]);
    expect(complete.notes.find((note) => note.path === "WEG Manager/Nie.md")?.values.title).toBe(
      "Item 2",
    );
  });
});
