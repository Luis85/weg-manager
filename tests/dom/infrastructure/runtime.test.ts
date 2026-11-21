import { describe, expect, it, vi } from "vitest";
import { showGreeting } from "../../../src/application/use-cases";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, Plugin, recordedNotices } = await import("@test/obsidian");
const { appLayer } = await import("../../../src/infrastructure/obsidian/app-layer");
const { makeRuntime } = await import("../../../src/infrastructure/runtime");

class Bare extends Plugin {}

describe("makeRuntime(appLayer(plugin))", () => {
  it("runs a use case against the Obsidian adapters", async () => {
    const { plugin } = createTestPlugin(Bare, { data: { greeting: "Moin" } });
    const runtime = makeRuntime(appLayer(plugin as never, { developmentMode: false }));
    await runtime.runPromise(showGreeting);
    expect(recordedNotices().map((notice) => notice.text)).toEqual([
      expect.stringContaining("Moin"),
    ]);
    await runtime.dispose();
  });

  it("rejects effects after dispose", async () => {
    const { plugin } = createTestPlugin(Bare);
    const runtime = makeRuntime(appLayer(plugin as never, { developmentMode: false }));
    await runtime.runPromise(showGreeting);
    await runtime.dispose();
    await expect(runtime.runPromise(showGreeting)).rejects.toThrow(/dispos/i);
  });
});
