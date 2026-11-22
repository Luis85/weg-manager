import { Effect, Layer, ManagedRuntime } from "effect";
import { describe, expect, it, vi } from "vitest";
import { AppEvent } from "../../../../src/application/events";
import {
  recordingEventBus,
  recordingLogger,
  recordingNotifier,
  sequentialIncidents,
  testMessages,
} from "../../../support/layers";
import { asObsidianPlugin } from "../../../support/obsidian/real";

vi.mock("obsidian", () => import("@test/obsidian"));

const { Plugin, createTestPlugin } = await import("@test/obsidian");
const { hostEventsLayer } = await import("../../../../src/infrastructure/obsidian/shell/events");

class Bare extends Plugin {}

type TestApp = ReturnType<typeof createTestPlugin>["app"];

const NOTES = {
  "Ahornweg.md": "---\nschema: weg-manager.community/v1\n---\n",
  "Punkte/P-001.md": "---\nschema: weg-manager.item/v1\n---\nText\n",
  "Privat.md": "# Ohne Frontmatter\n",
};

/** A vault holding `NOTES`, every one indexed, as a warm cache or a running app has it. */
const vaultWithNotes = async () => {
  const { plugin, app } = createTestPlugin(Bare);
  for (const [path, text] of Object.entries(NOTES)) app.vault.seedFile(path, text);
  await app.metadataCache.whenIndexed();
  return { plugin, app };
};

const start = async (plugin: InstanceType<typeof Bare>, app: TestApp) => {
  const bus = recordingEventBus();
  const logger = recordingLogger();
  const layer = hostEventsLayer(asObsidianPlugin(plugin)).pipe(
    Layer.provideMerge(
      Layer.mergeAll(
        bus.layer,
        logger.layer,
        recordingNotifier().layer,
        sequentialIncidents(),
        testMessages,
      ),
    ),
  );
  const runtime = ManagedRuntime.make(layer);
  await runtime.runPromise(Effect.void);
  const tags = () => bus.published().map((event) => event._tag);
  const listeners = () =>
    app.vault.listenerCount() + app.metadataCache.listenerCount() + app.workspace.listenerCount();
  return { bus, logger, runtime, tags, listeners };
};

const macrotask = () => new Promise((resolve) => setTimeout(resolve, 0));
const changed = (path: string) => AppEvent.MetadataChanged({ path, extension: "md" });
const layoutReady = AppEvent.LayoutReady();
const vaultReady = AppEvent.VaultReady();

describe("VaultReady", () => {
  it("waits on a cold start until the cache holds every note, then fires once", async () => {
    const { plugin, app } = await vaultWithNotes();
    app.workspace.layoutReady = false;
    app.metadataCache.startCold();
    const { bus, runtime } = await start(plugin, app);
    app.workspace.markLayoutReady();
    expect(bus.published()).toEqual([layoutReady]);
    await macrotask();
    // `resolved` has fired, but two notes still wait.
    expect(bus.published()).toEqual([layoutReady, changed("Ahornweg.md")]);
    await app.metadataCache.whenIndexed();
    app.metadataCache.resolveAll();
    expect(bus.published()).toEqual([
      layoutReady,
      changed("Ahornweg.md"),
      changed("Punkte/P-001.md"),
      changed("Privat.md"),
      vaultReady,
    ]);
    await runtime.dispose();
  });

  it("fires with LayoutReady when a cold cache completes before the layout is ready", async () => {
    const { plugin, app } = await vaultWithNotes();
    app.workspace.layoutReady = false;
    app.metadataCache.startCold();
    const { bus, runtime } = await start(plugin, app);
    await app.metadataCache.whenIndexed();
    expect(bus.published()).toEqual([]);
    app.workspace.markLayoutReady();
    expect(bus.published()).toEqual([layoutReady, vaultReady]);
    await runtime.dispose();
  });

  it("fires with LayoutReady on a warm restart and not again on the resolve that follows", async () => {
    const { plugin, app } = await vaultWithNotes();
    app.workspace.layoutReady = false;
    const { bus, runtime } = await start(plugin, app);
    app.workspace.markLayoutReady();
    expect(bus.published()).toEqual([layoutReady, vaultReady]);
    app.metadataCache.resolveAll();
    expect(bus.published()).toEqual([layoutReady, vaultReady]);
    await runtime.dispose();
  });

  it("fires at once when the plugin is enabled in a running app, where resolved will not fire", async () => {
    const { plugin, app } = await vaultWithNotes();
    const { bus, runtime } = await start(plugin, app);
    expect(bus.published()).toEqual([layoutReady, vaultReady]);
    app.vault.seedFile("Neu.md", "---\na: 1\n---\n");
    await app.metadataCache.whenIndexed();
    expect(bus.published()).toEqual([
      layoutReady,
      vaultReady,
      AppEvent.FileCreated({ path: "Neu.md", extension: "md" }),
      changed("Neu.md"),
    ]);
    await runtime.dispose();
  });

  it("waits for Obsidian when the plugin is enabled while the cache is still being built", async () => {
    const { plugin, app } = await vaultWithNotes();
    app.metadataCache.startCold();
    const { tags, runtime } = await start(plugin, app);
    expect(tags()).toEqual(["LayoutReady"]);
    await app.metadataCache.whenIndexed();
    expect(tags()).toEqual([
      "LayoutReady",
      "MetadataChanged",
      "MetadataChanged",
      "MetadataChanged",
      "VaultReady",
    ]);
    await runtime.dispose();
  });

  it("also waits for a note that appears while it waits", async () => {
    const { plugin, app } = await vaultWithNotes();
    app.metadataCache.startCold();
    const { tags, runtime } = await start(plugin, app);
    await macrotask();
    await macrotask();
    // Indexed after the last note it waited for, so only the final scan finds it.
    app.vault.seedFile("Neu.md", "---\na: 1\n---\n");
    await app.metadataCache.whenIndexed();
    expect(tags()).toEqual([
      "LayoutReady",
      "MetadataChanged",
      "MetadataChanged",
      "FileCreated",
      "MetadataChanged",
      "MetadataChanged",
      "VaultReady",
    ]);
    await runtime.dispose();
  });

  it("does not wait for a note that is deleted before Obsidian indexed it", async () => {
    const { plugin, app } = await vaultWithNotes();
    app.metadataCache.startCold();
    const { tags, runtime } = await start(plugin, app);
    const last = app.vault.getFileByPath("Privat.md");
    if (last === null) throw new Error("no Privat.md");
    await app.fileManager.trashFile(last);
    // One note was indexed during the trash's write; the second waits, the deleted one never comes.
    expect(tags()).toEqual(["LayoutReady", "MetadataChanged", "FileDeleted"]);
    await app.metadataCache.whenIndexed();
    expect(tags()).toEqual([
      "LayoutReady",
      "MetadataChanged",
      "FileDeleted",
      "MetadataChanged",
      "VaultReady",
    ]);
    await runtime.dispose();
  });

  it("publishes nothing once the runtime is disposed before the cache is complete", async () => {
    const { plugin, app } = await vaultWithNotes();
    app.metadataCache.startCold();
    const { bus, runtime, listeners } = await start(plugin, app);
    expect(app.metadataCache.listenerCount("resolved")).toBe(1);
    await runtime.dispose();
    expect(listeners()).toBe(0);
    await app.metadataCache.whenIndexed();
    expect(bus.published()).toEqual([layoutReady]);
  });

  it("reports a failing cache read as a defect and fires on a later resolved", async () => {
    const { plugin, app } = await vaultWithNotes();
    app.vault.failReads = true;
    const { bus, logger, runtime } = await start(plugin, app);
    expect(bus.published()).toEqual([layoutReady]);
    expect(logger.entries().map((entry) => entry.event)).toEqual(["defect.reported"]);
    app.vault.failReads = false;
    expect(() => app.metadataCache.resolveAll()).not.toThrow();
    expect(bus.published()).toEqual([layoutReady, vaultReady]);
    await runtime.dispose();
  });
});
