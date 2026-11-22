import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { afterEach, vi } from "vitest";
import {
  Clipboard,
  HostInfo,
  Notifier,
  SettingsStore,
} from "../../../../src/application/shell/ports";
import { ISSUES_URL } from "../../../../src/application/shell";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, Plugin, recordedNotices } = await import("@test/obsidian");
const { shellAdapters, NOTICE_DURATION } =
  await import("../../../../src/infrastructure/obsidian/shell/layers");

class Bare extends Plugin {}

const setup = (options: { data?: unknown; failLoadData?: boolean } = {}) => {
  const { plugin, registry, app } = createTestPlugin(Bare, options);
  const adapters = shellAdapters(plugin as never);
  const layer = Layer.mergeAll(
    adapters.settingsStore,
    adapters.notifier,
    adapters.clipboard,
    adapters.hostInfo,
  );
  return { plugin, registry, app, layer };
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("shellAdapters", () => {
  it.effect("saves through plugin.saveData", () => {
    const { registry, layer } = setup();
    return Effect.gen(function* () {
      yield* (yield* SettingsStore).save({ logLevel: "debug" });
      assert.deepStrictEqual(registry.saved, [{ logLevel: "debug" }]);
    }).pipe(Effect.provide(layer));
  });

  it.effect("loads plugin data", () => {
    const { layer } = setup({ data: { logLevel: "info" } });
    return Effect.gen(function* () {
      assert.deepStrictEqual(yield* (yield* SettingsStore).load, { logLevel: "info" });
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

  it.effect("shows a message's link as a link that opens outside Obsidian", () => {
    const { layer } = setup();
    return Effect.gen(function* () {
      yield* (yield* Notifier).notify({
        severity: "error",
        title: "Titel",
        detail: "Details",
        link: ISSUES_URL,
      });
      const link = recordedNotices()[0]?.notice.messageEl.querySelector("a");
      assert.deepStrictEqual(
        [link?.getAttribute("href"), link?.textContent, link?.target, link?.rel],
        [ISSUES_URL, ISSUES_URL, "_blank", "noopener"],
      );
      yield* (yield* Notifier).notify({ severity: "info", title: "Ohne", detail: "" });
      assert.isNull(recordedNotices()[1]?.notice.messageEl.querySelector("a") ?? null);
    }).pipe(Effect.provide(layer));
  });

  it.effect("keeps errors up longer than warnings and warnings longer than info", () =>
    Effect.sync(() => {
      assert.isAbove(NOTICE_DURATION.error, NOTICE_DURATION.warning);
      assert.isAbove(NOTICE_DURATION.warning, NOTICE_DURATION.info);
    }),
  );

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
