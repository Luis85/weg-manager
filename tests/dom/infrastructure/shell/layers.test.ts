import { assert, describe, it } from "@effect/vitest";
import { Effect } from "effect";
import { afterEach, vi } from "vitest";
import {
  Clipboard,
  HostInfo,
  Notifier,
  SettingsStore,
  VaultReader,
} from "../../../../src/application/shell/ports";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, Plugin, recordedNotices } = await import("@test/obsidian");
const { obsidianLayer, NOTICE_DURATION } =
  await import("../../../../src/infrastructure/obsidian/shell/layers");

class Bare extends Plugin {}

const setup = (options: { data?: unknown; failLoadData?: boolean } = {}) => {
  const { plugin, registry, app } = createTestPlugin(Bare, options);
  return { plugin, registry, app, layer: obsidianLayer(plugin as never, "de") };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("obsidianLayer", () => {
  it.effect("saves through plugin.saveData", () => {
    const { registry, layer } = setup();
    return Effect.gen(function* () {
      yield* (yield* SettingsStore).save({ greeting: "Moin" });
      assert.deepStrictEqual(registry.saved, [{ greeting: "Moin" }]);
    }).pipe(Effect.provide(layer));
  });

  it.effect("loads plugin data", () => {
    const { layer } = setup({ data: { greeting: "Hallo" } });
    return Effect.gen(function* () {
      assert.deepStrictEqual(yield* (yield* SettingsStore).load, { greeting: "Hallo" });
    }).pipe(Effect.provide(layer));
  });

  it.effect("turns a rejected loadData into StorageError", () => {
    const { layer } = setup({ failLoadData: true });
    return Effect.gen(function* () {
      const error = yield* Effect.flip((yield* SettingsStore).load);
      assert.strictEqual(error._tag, "StorageError");
    }).pipe(Effect.provide(layer));
  });

  it.effect("shows one notice with a bold title and the detail", () => {
    const { layer } = setup();
    return Effect.gen(function* () {
      yield* (yield* Notifier).notify({ severity: "error", title: "Titel", detail: "Details" });
      const notices = recordedNotices();
      assert.strictEqual(notices.length, 1);
      const el = notices[0]?.notice.messageEl;
      assert.strictEqual(el?.querySelector("strong")?.textContent, "Titel");
      assert.include(el?.textContent ?? "", "Details");
      assert.strictEqual(notices[0]?.duration, NOTICE_DURATION.error);
    }).pipe(Effect.provide(layer));
  });

  it.effect("keeps errors up longer than warnings and warnings longer than info", () =>
    Effect.sync(() => {
      assert.isAbove(NOTICE_DURATION.error, NOTICE_DURATION.warning);
      assert.isAbove(NOTICE_DURATION.warning, NOTICE_DURATION.info);
    }),
  );

  it.effect("counts markdown files and maps a throw to VaultReadError", () => {
    const { app, layer } = setup();
    return Effect.gen(function* () {
      const vault = yield* VaultReader;
      app.vault.setMarkdownFileCount(3);
      assert.strictEqual(yield* vault.markdownFileCount, 3);
      app.vault.failReads = true;
      const error = yield* Effect.flip(vault.markdownFileCount);
      assert.strictEqual(error._tag, "VaultReadError");
    }).pipe(Effect.provide(layer));
  });

  it.effect("writes to the clipboard and maps a rejection to ClipboardError", () => {
    const writeText = vi.fn<(text: string) => Promise<void>>().mockResolvedValueOnce();
    vi.stubGlobal("navigator", { clipboard: { writeText } });
    const { layer } = setup();
    return Effect.gen(function* () {
      const clipboard = yield* Clipboard;
      yield* clipboard.write("Bericht");
      assert.deepStrictEqual(writeText.mock.calls, [["Bericht"]]);
      writeText.mockRejectedValueOnce(new Error("denied"));
      const error = yield* Effect.flip(clipboard.write("Bericht"));
      assert.strictEqual(error._tag, "ClipboardError");
    }).pipe(Effect.provide(layer));
  });

  it.effect("describes the host from the manifest, apiVersion and platform", () => {
    const { layer } = setup();
    return Effect.gen(function* () {
      const host = yield* HostInfo;
      assert.deepStrictEqual(
        { pluginVersion: host.pluginVersion, apiVersion: host.apiVersion, platform: host.platform },
        { pluginVersion: "0.1.0", apiVersion: "1.15.1", platform: "desktop-linux" },
      );
    }).pipe(Effect.provide(layer));
  });
});
