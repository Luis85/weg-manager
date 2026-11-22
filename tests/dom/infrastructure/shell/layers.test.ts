import { assert, describe, it } from "@effect/vitest";
import { Effect, Layer } from "effect";
import { afterEach, expect, vi } from "vitest";
import {
  Clipboard,
  HostInfo,
  Notifier,
  SettingsStore,
} from "../../../../src/application/shell/ports";
import { ISSUES_URL } from "../../../../src/application/shell";

vi.mock("obsidian", () => import("@test/obsidian"));

const { createTestPlugin, Platform, Plugin, recordedNotices } = await import("@test/obsidian");
const { shellAdapters, NOTICE_DURATION } =
  await import("../../../../src/infrastructure/obsidian/shell/layers");

class Bare extends Plugin {}

/** The double's platform flags as it starts (Linux desktop), restored after each test. */
const ORIGINAL_PLATFORM = { ...Platform };
/** Every flag off, so a case sets only the flags it means. */
const NO_PLATFORM = Object.fromEntries(Object.keys(Platform).map((flag) => [flag, false]));

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
  Object.assign(Platform, ORIGINAL_PLATFORM);
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

  it.effect("keeps a notice up the longer, the more severe it is", () => {
    const { layer } = setup();
    return Effect.gen(function* () {
      const notifier = yield* Notifier;
      for (const severity of ["info", "warning", "error"] as const) {
        yield* notifier.notify({ severity, title: severity, detail: "" });
      }
      const [info, warning, error] = recordedNotices().map((notice) => notice.duration ?? 0);
      assert.isAbove(info ?? 0, 0);
      assert.isAbove(warning ?? 0, info ?? 0);
      assert.isAbove(error ?? 0, warning ?? 0);
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

  it.effect("describes the host from the manifest and the API version", () => {
    const { layer } = setup();
    return Effect.gen(function* () {
      const host = yield* HostInfo;
      assert.deepStrictEqual(
        { pluginVersion: host.pluginVersion, apiVersion: host.apiVersion },
        { pluginVersion: "0.1.0", apiVersion: "1.15.1" },
      );
    }).pipe(Effect.provide(layer));
  });
});

/** What Obsidian's `Platform` flags say, and the name the diagnostics give that platform. */
const PLATFORMS: readonly (readonly [
  string,
  Partial<Record<keyof typeof Platform, boolean>>,
  string,
])[] = [
  ["macOS", { isMacOS: true }, "desktop-macos"],
  ["Windows", { isWin: true }, "desktop-windows"],
  ["Linux", { isLinux: true }, "desktop-linux"],
  ["an iOS app", { isMobile: true, isIosApp: true }, "mobile-ios"],
  ["an Android app", { isMobile: true, isAndroidApp: true }, "mobile-android"],
  ["a desktop that no flag names", {}, "desktop"],
  ["a mobile device that no flag names", { isMobile: true }, "mobile"],
];

describe("the platform the host adapter reports", () => {
  it.each(PLATFORMS)("names %s", async (_name, flags, expected) => {
    Object.assign(Platform, NO_PLATFORM, flags);
    const { layer } = setup();
    const platform = await Effect.runPromise(
      Effect.gen(function* () {
        return (yield* HostInfo).platform;
      }).pipe(Effect.provide(layer)),
    );
    expect(platform).toBe(expected);
  });
});
