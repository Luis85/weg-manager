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

const { Plugin, TFile, TFolder, createTestPlugin } = await import("@test/obsidian");
const { hostEventsLayer } = await import("../../../../src/infrastructure/obsidian/shell/events");

class Bare extends Plugin {}

/** A file whose extension cannot be read, so mapping it throws. */
class BrokenFile extends TFile {
  override get extension(): string {
    throw new Error("broken file");
  }
}

const started = async (options: { readonly layoutReady?: boolean } = {}) => {
  const { plugin, app } = createTestPlugin(Bare);
  app.workspace.layoutReady = options.layoutReady ?? true;
  const bus = recordingEventBus();
  const logger = recordingLogger();
  const notifier = recordingNotifier();
  const layer = hostEventsLayer(asObsidianPlugin(plugin)).pipe(
    Layer.provideMerge(
      Layer.mergeAll(bus.layer, logger.layer, notifier.layer, sequentialIncidents(), testMessages),
    ),
  );
  const runtime = ManagedRuntime.make(layer);
  await runtime.runPromise(Effect.void);
  const listeners = () =>
    app.vault.listenerCount() + app.metadataCache.listenerCount() + app.workspace.listenerCount();
  return { app, bus, logger, notifier, runtime, listeners };
};

const ready = AppEvent.LayoutReady();
/** What a runtime publishes first when the layout is ready and the (empty) vault is indexed. */
const startup = [ready, AppEvent.VaultReady()];

describe("hostEventsLayer", () => {
  it("publishes LayoutReady at once when the layout is already ready, then VaultReady", async () => {
    const { bus, runtime } = await started();
    expect(bus.published()).toEqual(startup);
    await runtime.dispose();
  });

  it("maps vault file events and ignores folders", async () => {
    const { app, bus, runtime } = await started();
    const note = new TFile("Ahornweg/Punkt.md");
    app.vault.trigger("create", note);
    app.vault.trigger("modify", note);
    app.vault.trigger("rename", new TFile("Ahornweg/Punkt 2.md"), "Ahornweg/Punkt.md");
    app.vault.trigger("delete", new TFile("bild.png"));
    for (const name of ["create", "modify", "delete"]) {
      app.vault.trigger(name, new TFolder("Ahornweg"));
    }
    app.vault.trigger("rename", new TFolder("Birkenweg"), "Ahornweg");
    expect(bus.published()).toEqual([
      ...startup,
      AppEvent.FileCreated({ path: "Ahornweg/Punkt.md", extension: "md" }),
      AppEvent.FileModified({ path: "Ahornweg/Punkt.md", extension: "md" }),
      AppEvent.FileRenamed({
        path: "Ahornweg/Punkt 2.md",
        oldPath: "Ahornweg/Punkt.md",
        extension: "md",
      }),
      AppEvent.FileDeleted({ path: "bild.png", extension: "png" }),
    ]);
    await runtime.dispose();
  });

  it("maps metadata changes", async () => {
    const { app, bus, runtime } = await started();
    app.metadataCache.trigger("changed", new TFile("a.md"), "content", {});
    expect(bus.published()).toEqual([
      ...startup,
      AppEvent.MetadataChanged({ path: "a.md", extension: "md" }),
    ]);
    await runtime.dispose();
  });

  it("publishes nothing before the layout is ready, then LayoutReady, then file events", async () => {
    const { app, bus, runtime } = await started({ layoutReady: false });
    // Obsidian fires `create` for every existing file while it starts.
    app.vault.trigger("create", new TFile("existing.md"));
    app.metadataCache.trigger("changed", new TFile("existing.md"), "", {});
    expect(bus.published()).toEqual([]);
    app.workspace.markLayoutReady();
    app.vault.trigger("create", new TFile("new.md"));
    expect(bus.published()).toEqual([
      ...startup,
      AppEvent.FileCreated({ path: "new.md", extension: "md" }),
    ]);
    await runtime.dispose();
  });

  it("removes every listener on dispose, even before the layout was ready", async () => {
    const { app, bus, runtime, listeners } = await started({ layoutReady: false });
    expect(app.vault.listenerCount()).toBe(4);
    expect(app.metadataCache.listenerCount("changed")).toBe(1);
    expect(app.metadataCache.listenerCount("resolved")).toBe(1);
    expect(app.metadataCache.listenerCount()).toBe(2);
    expect(app.workspace.listenerCount()).toBe(0);
    await runtime.dispose();
    expect(listeners()).toBe(0);
    app.workspace.markLayoutReady();
    expect(bus.published()).toEqual([]);
  });

  it("reports a throwing mapping as a defect without throwing into Obsidian", async () => {
    const { app, bus, logger, notifier, runtime } = await started();
    expect(() => app.vault.trigger("create", new BrokenFile("x.md"))).not.toThrow();
    expect(logger.entries().map((entry) => entry.event)).toEqual(["defect.reported"]);
    expect(notifier.messages()).toHaveLength(1);
    app.vault.trigger("create", new TFile("next.md"));
    expect(bus.published().at(-1)).toEqual(
      AppEvent.FileCreated({ path: "next.md", extension: "md" }),
    );
    await runtime.dispose();
  });

  it("reports a dying publish as a defect without throwing into Obsidian", async () => {
    const { app, bus, logger, runtime } = await started();
    bus.failNextPublish();
    expect(() => app.vault.trigger("create", new TFile("a.md"))).not.toThrow();
    expect(logger.entries()).toEqual([
      expect.objectContaining({ event: "defect.reported", incidentId: "T-1" }),
    ]);
    await runtime.dispose();
  });
});
