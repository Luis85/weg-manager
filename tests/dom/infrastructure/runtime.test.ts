import { describe, expect, it, vi } from "vitest";
import { createCommunity } from "../../../src/application/communities";
import { asObsidianPlugin } from "../../support/obsidian/real";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, Plugin } = await import("@test/obsidian");
const { appLayer } = await import("../../../src/infrastructure/obsidian/app-layer");
const { makeRuntime } = await import("../../../src/infrastructure/runtime");

class Bare extends Plugin {}

const AHORNWEG = {
  name: "Ahornweg 12",
  short_code: "AW",
  color: "teal",
  kind: "WEG",
  unit_label: "Einheiten",
};

describe("makeRuntime(appLayer(plugin))", () => {
  it("runs a use case against the Obsidian adapters", async () => {
    const { plugin, app } = createTestPlugin(Bare, { data: { rootFolder: "Beirat" } });
    const runtime = makeRuntime(
      appLayer(asObsidianPlugin(plugin), { developmentMode: false, language: "de" }),
    );
    const note = await runtime.runPromise(createCommunity(AHORNWEG));
    expect(note.path).toBe("Beirat/Gemeinschaften/Ahornweg 12.md");
    expect(app.vault.getFileByPath(note.path)).not.toBeNull();
    await runtime.dispose();
  });

  it("rejects effects after dispose", async () => {
    const { plugin } = createTestPlugin(Bare);
    const runtime = makeRuntime(
      appLayer(asObsidianPlugin(plugin), { developmentMode: false, language: "de" }),
    );
    await runtime.runPromise(createCommunity(AHORNWEG));
    await runtime.dispose();
    await expect(runtime.runPromise(createCommunity(AHORNWEG))).rejects.toThrow(/dispos/i);
  });
});
