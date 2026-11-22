import { Effect, Layer, Option, Result, Stream } from "effect";
import { afterEach, describe, expect, it, vi } from "vitest";
import { eventually } from "../../../support/wait";
import type { AppRuntime, AppServices } from "../../../../src/application/app-services";
import { appNoteTypes } from "../../../../src/application/note-types";
import {
  NoteStore,
  noteChanges,
  noteSnapshot,
  unindexedChanges,
  unindexedSnapshot,
  type NoteSnapshot,
} from "../../../../src/application/notes";
import { appServicesLayer } from "../../../../src/application/app-services-layer";
import { useStream } from "../../../../src/presentation/shell";
import { host } from "../../../support/composable";
import { FULL, testItem } from "../../../support/notes/test-note-type";

vi.mock("obsidian", () => import("@test/obsidian"));

const { ManagedRuntime } = await import("effect");
const { Plugin, createTestPlugin, stringifyYaml } = await import("@test/obsidian");
const { shellAdapters } = await import("../../../../src/infrastructure/obsidian/shell");
const { notesAdapters } = await import("../../../../src/infrastructure/obsidian/notes");

class Bare extends Plugin {}

type TestSnapshot = NoteSnapshot<typeof testItem.fields>;

const text = (frontmatter: Record<string, unknown>) => `---\n${stringifyYaml(frontmatter)}---\n`;

const item = (n: number) => ({
  ...FULL,
  id: `test-item-00000000-0000-4000-8000-${n.toString(16).padStart(12, "0")}`,
  title: `Item ${n}`,
});

const runtimes: AppRuntime[] = [];

afterEach(async () => {
  await Promise.all(runtimes.splice(0).map((runtime) => runtime.dispose()));
});

/**
 * The plugin's own composition on the Obsidian double: the application's services over the
 * Obsidian adapters, with the index for the app's types and the test type, host events last.
 */
const start = async (plugin: InstanceType<typeof Bare>) => {
  const layer: Layer.Layer<AppServices> = appServicesLayer(
    { ...shellAdapters(plugin as never), ...notesAdapters(plugin as never) },
    { developmentMode: false, language: "de", noteTypes: [...appNoteTypes, testItem] },
  );
  const runtime: AppRuntime = ManagedRuntime.make(layer);
  runtimes.push(runtime);
  // Built before a view mounts, as bootstrap does it.
  await runtime.runPromise(Effect.void);
  return runtime;
};

/** Waits, without a timer, for the first snapshot of the test type that `holds`. */
const next = (runtime: AppRuntime, holds: (snapshot: TestSnapshot) => boolean) =>
  runtime.runPromise(
    Effect.map(Stream.runHead(Stream.filter(noteChanges(testItem), holds)), Option.getOrThrow),
  );

describe("the note index on the Obsidian double", () => {
  it("waits on a cold start until Obsidian has indexed every note, then builds once", async () => {
    const { plugin, app } = createTestPlugin(Bare);
    app.vault.seedFile("WEG Manager/A.md", text(item(1)));
    app.vault.seedFile("WEG Manager/Kaputt.md", "---\nschema: [unclosed\n---\n");
    app.vault.seedFile("Privat/Ohne.md", "# Text\n");
    app.vault.seedFile("Privat/B.md", text(item(2)));
    await app.metadataCache.whenIndexed();
    app.workspace.layoutReady = false;
    app.metadataCache.startCold();
    const runtime = await start(plugin);
    const { exposed } = host(runtime, () => ({
      notes: useStream(noteSnapshot(testItem), noteChanges(testItem)),
      unindexed: useStream(unindexedSnapshot, unindexedChanges),
    }));
    app.workspace.markLayoutReady();
    expect(exposed.notes.value).toEqual({ ready: false, failure: undefined, notes: [] });
    const ready = await next(runtime, (snapshot) => snapshot.ready);
    expect(ready.notes.map((note) => [note.path, note.kind])).toEqual([
      ["Privat/B.md", "editable"],
      ["WEG Manager/A.md", "editable"],
    ]);
    await eventually(() => {
      expect(exposed.notes.value).toBe(ready);
    });
    expect(exposed.unindexed.value.notes).toEqual([
      { path: "WEG Manager/Kaputt.md", issue: { code: "frontmatter.unreadable" } },
    ]);
  });

  it("shows each write through the store once Obsidian has indexed it", async () => {
    const { plugin } = createTestPlugin(Bare);
    const runtime = await start(plugin);
    await next(runtime, (snapshot) => snapshot.ready);
    const store = (use: (notes: NoteStore["Service"]) => Effect.Effect<unknown, unknown>) =>
      runtime.runPromise(Effect.orDie(NoteStore.use(use)));
    await store((notes) =>
      notes.create({ folder: "WEG Manager", name: "A", frontmatter: item(1) }),
    );
    expect((await next(runtime, (s) => s.notes.length === 1)).notes[0]?.path).toBe(
      "WEG Manager/A.md",
    );
    await store((notes) =>
      notes.update("WEG Manager/A.md", () => Result.succeed({ set: { title: "Neu" } })),
    );
    await next(runtime, (s) => s.notes[0]?.values.title === "Neu");
    await store((notes) => notes.rename("WEG Manager/A.md", "B"));
    await next(runtime, (s) => s.notes[0]?.path === "WEG Manager/B.md");
    await store((notes) => notes.trash("WEG Manager/B.md"));
    await next(runtime, (s) => s.notes.length === 0);
  });

  it("follows an outside edit, and stops with the runtime", async () => {
    const { plugin, app } = createTestPlugin(Bare);
    app.vault.seedFile("A.md", text(item(1)));
    await app.metadataCache.whenIndexed();
    const runtime = await start(plugin);
    const { exposed } = host(runtime, () =>
      useStream(noteSnapshot(testItem), noteChanges(testItem)),
    );
    await next(runtime, (snapshot) => snapshot.ready);
    app.vault.seedFile("A.md", text({ ...item(1), title: "Von außen" }));
    await next(runtime, (s) => s.notes[0]?.values.title === "Von außen");
    await runtime.dispose();
    const listeners = app.vault.listenerCount() + app.metadataCache.listenerCount();
    expect(listeners).toBe(0);
    const last = exposed.value;
    app.vault.seedFile("B.md", text(item(2)));
    await app.metadataCache.whenIndexed();
    expect(exposed.value).toBe(last);
  });
});
